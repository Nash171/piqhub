import { getClient } from './db';
import { hashPassword } from './auth';
import { getMatchById, getRegistration, getBetForMatch, getBetsForMatch } from './queries';
import { Event, Match, Bet, EventStatus, EventRegistrationStatus } from '@/types';

export async function createEventLogic(name: string, status: string): Promise<Event> {
  const db = getClient();
  const result = await db.execute({
    sql: 'INSERT INTO events (name, status) VALUES (?, ?) RETURNING id, name, status, created_at',
    args: [name, status],
  });
  return result.rows[0] as unknown as Event;
}

export async function updateEventLogic(eventId: number, name: string, status: EventStatus): Promise<void> {
  const db = getClient();
  const result = await db.execute({
    sql: 'UPDATE events SET name = ?, status = ? WHERE id = ? RETURNING id',
    args: [name, status, eventId],
  });
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
}

export async function deleteEventLogic(eventId: number): Promise<void> {
  const db = getClient();
  const result = await db.execute({
    sql: 'DELETE FROM events WHERE id = ? RETURNING id',
    args: [eventId],
  });
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
}

export async function createMatchLogic(
  eventId: number,
  teamA: string,
  teamB: string,
  matchTime: string
): Promise<Match> {
  const db = getClient();
  const result = await db.execute({
    sql: 'INSERT INTO matches (event_id, team_a, team_b, match_time) VALUES (?, ?, ?, ?) RETURNING id, event_id, team_a, team_b, match_time, winner, status',
    args: [eventId, teamA, teamB, matchTime],
  });
  return result.rows[0] as unknown as Match;
}

export async function updateEventStatusLogic(eventId: number, status: EventStatus): Promise<void> {
  const db = getClient();
  const result = await db.execute({
    sql: 'UPDATE events SET status = ? WHERE id = ? RETURNING id',
    args: [status, eventId],
  });
  if (result.rows.length === 0) {
    throw new Error('Event not found');
  }
}

export async function registerForEventLogic(userId: number, eventId: number): Promise<void> {
  const db = getClient();
  const eventResult = await db.execute({
    sql: 'SELECT status FROM events WHERE id = ?',
    args: [eventId],
  });
  if (eventResult.rows.length === 0) {
    throw new Error('Event not found');
  }
  const eventStatus = eventResult.rows[0].status as EventStatus;
  if (eventStatus !== 'open') {
    throw new Error('Registration is not open for this event');
  }

  await db.execute({
    sql: 'INSERT INTO event_registrations (event_id, user_id, coins, status) VALUES (?, ?, ?, ?)',
    args: [eventId, userId, 1000, 'pending'],
  });
}

export async function updateRegistrationStatusLogic(
  registrationId: number,
  status: EventRegistrationStatus
): Promise<void> {
  const db = getClient();
  const result = await db.execute({
    sql: 'UPDATE event_registrations SET status = ? WHERE id = ? RETURNING id',
    args: [status, registrationId],
  });
  if (result.rows.length === 0) {
    throw new Error('Registration not found');
  }
}

export async function placeBetLogic(
  userId: number,
  matchId: number,
  teamChosen: 'team_a' | 'team_b',
  amount: number
): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'completed') throw new Error('Match already completed');

  const now = new Date();
  const matchTime = new Date(match.match_time);
  if (now >= matchTime) {
    throw new Error('Betting deadline has passed');
  }

  const existingBet = await getBetForMatch(matchId, userId);
  if (existingBet) {
    throw new Error('You have already bet on this match');
  }

  const registration = await getRegistration(match.event_id, userId);
  if (!registration) {
    throw new Error('You must register for the event first');
  }
  if (registration.status !== 'confirmed') {
    throw new Error(`Registration is ${registration.status}`);
  }
  if (registration.coins < amount) {
    throw new Error('Insufficient coins');
  }

  await db.execute({
    sql: 'UPDATE event_registrations SET coins = coins - ? WHERE id = ?',
    args: [amount, registration.id],
  });

  await db.execute({
    sql: 'INSERT INTO bets (match_id, user_id, team_chosen, amount) VALUES (?, ?, ?, ?)',
    args: [matchId, userId, teamChosen, amount],
  });
}

export async function updateBetLogic(
  userId: number,
  matchId: number,
  teamChosen: 'team_a' | 'team_b',
  amount: number
): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'locked') throw new Error('Match is locked');
  if (match.status === 'completed') throw new Error('Match already completed');

  const now = new Date();
  const matchTime = new Date(match.match_time);
  if (now >= matchTime) {
    throw new Error('Betting deadline has passed');
  }

  const existingBet = await getBetForMatch(matchId, userId);
  if (!existingBet) {
    throw new Error('You have not bet on this match');
  }

  const registration = await getRegistration(match.event_id, userId);
  if (!registration) {
    throw new Error('You must register for the event first');
  }
  if (registration.status !== 'confirmed') {
    throw new Error(`Registration is ${registration.status}`);
  }

  const availableCoins = registration.coins + existingBet.amount;
  if (availableCoins < amount) {
    throw new Error('Insufficient coins');
  }

  await db.execute({
    sql: 'UPDATE event_registrations SET coins = ? WHERE id = ?',
    args: [availableCoins - amount, registration.id],
  });

  await db.execute({
    sql: 'UPDATE bets SET team_chosen = ?, amount = ? WHERE id = ?',
    args: [teamChosen, amount, existingBet.id],
  });
}

export async function applyMatchPayouts(
  matchId: number,
  winner: 'team_a' | 'team_b'
): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');

  const bets = await getBetsForMatch(matchId);
  const winningBets = bets.filter((b) => b.team_chosen === winner);
  const losingBets = bets.filter((b) => b.team_chosen !== winner);

  const losingPool = losingBets.reduce((sum, b) => sum + b.amount, 0);
  const winningPool = winningBets.reduce((sum, b) => sum + b.amount, 0);

  if (winningPool > 0) {
    for (const bet of winningBets) {
      const profit = losingPool > 0 ? Math.floor((bet.amount / winningPool) * losingPool) : 0;
      const payout = bet.amount + profit;
      await db.execute({
        sql: 'UPDATE event_registrations SET coins = coins + ? WHERE event_id = ? AND user_id = ?',
        args: [payout, match.event_id, bet.user_id],
      });
    }
  } else if (losingPool > 0) {
    for (const bet of losingBets) {
      await db.execute({
        sql: 'UPDATE event_registrations SET coins = coins + ? WHERE event_id = ? AND user_id = ?',
        args: [bet.amount, match.event_id, bet.user_id],
      });
    }
  }
}

export async function setMatchWinnerLogic(matchId: number, winner: 'team_a' | 'team_b'): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'completed') throw new Error('Winner already set');

  const now = new Date();
  const matchTime = new Date(match.match_time);
  if (now < matchTime) {
    throw new Error('Cannot set winner before match starts');
  }

  await db.execute({
    sql: 'UPDATE matches SET winner = ?, status = ? WHERE id = ?',
    args: [winner, 'completed', matchId],
  });

  await applyMatchPayouts(matchId, winner);
}

export async function resetMatchWinnerLogic(matchId: number): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status !== 'completed') throw new Error('Match is not completed');

  const now = new Date();
  const matchTime = new Date(match.match_time);
  const newStatus = now < matchTime ? 'upcoming' : 'locked';

  await db.execute({
    sql: 'UPDATE matches SET winner = NULL, status = ? WHERE id = ?',
    args: [newStatus, matchId],
  });
}

export async function updateMatchLogic(
  matchId: number,
  teamA: string,
  teamB: string,
  matchTime: string
): Promise<void> {
  const db = getClient();
  const match = await getMatchById(matchId);
  if (!match) throw new Error('Match not found');
  if (match.status === 'completed') throw new Error('Cannot edit a completed match');

  await db.execute({
    sql: 'UPDATE matches SET team_a = ?, team_b = ?, match_time = ? WHERE id = ?',
    args: [teamA, teamB, matchTime, matchId],
  });
}

export async function deleteMatchLogic(matchId: number): Promise<void> {
  const db = getClient();
  const result = await db.execute({
    sql: 'DELETE FROM matches WHERE id = ? RETURNING id',
    args: [matchId],
  });
  if (result.rows.length === 0) {
    throw new Error('Match not found');
  }
}

export async function recalculateEventPointsLogic(eventId: number): Promise<void> {
  const db = getClient();

  await db.execute({
    sql: 'UPDATE event_registrations SET coins = 1000 WHERE event_id = ?',
    args: [eventId],
  });

  await db.execute({
    sql: `UPDATE event_registrations
          SET coins = coins - COALESCE((
            SELECT SUM(b.amount)
            FROM bets b
            JOIN matches m ON b.match_id = m.id
            WHERE m.event_id = ? AND b.user_id = event_registrations.user_id
          ), 0)
          WHERE event_id = ?`,
    args: [eventId, eventId],
  });

  const matchesResult = await db.execute({
    sql: `SELECT id, winner FROM matches
          WHERE event_id = ? AND status = 'completed' AND winner IS NOT NULL
          ORDER BY match_time ASC, id ASC`,
    args: [eventId],
  });

  for (const row of matchesResult.rows) {
    await applyMatchPayouts(row.id as number, row.winner as 'team_a' | 'team_b');
  }
}

export function calculateBetResult(
  bet: Bet,
  match: Match,
  allBets: Bet[]
): { label: 'Won' | 'Lost'; amount: number } | null {
  if (match.status !== 'completed' || !match.winner) return null;

  const winningBets = allBets.filter((b) => b.team_chosen === match.winner);
  const losingBets = allBets.filter((b) => b.team_chosen !== match.winner);
  const winningPool = winningBets.reduce((sum, b) => sum + b.amount, 0);
  const losingPool = losingBets.reduce((sum, b) => sum + b.amount, 0);

  if (bet.team_chosen === match.winner) {
    const profit = losingPool > 0 ? Math.floor((bet.amount / winningPool) * losingPool) : 0;
    return { label: 'Won', amount: profit };
  }

  if (winningPool === 0) {
    return { label: 'Lost', amount: 0 };
  }

  return { label: 'Lost', amount: -bet.amount };
}

export async function resetUserPasswordLogic(userId: number, newPassword: string): Promise<void> {
  const db = getClient();
  const passwordHash = await hashPassword(newPassword);
  await db.execute({
    sql: 'UPDATE users SET password_hash = ? WHERE id = ?',
    args: [passwordHash, userId],
  });
}
