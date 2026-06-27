import { getClient } from './db';
import { Event, Match, Bet, LeaderboardEntry, EventRegistration, EventRegistrationStatus } from '@/types';

export async function getEvents(): Promise<Event[]> {
  const db = getClient();
  const result = await db.execute('SELECT id, name, status, created_at FROM events ORDER BY created_at DESC');
  return result.rows as unknown as Event[];
}

export async function getPublicEvents(): Promise<Event[]> {
  const db = getClient();
  const result = await db.execute({
    sql: "SELECT id, name, status, created_at FROM events WHERE status != 'hidden' ORDER BY created_at DESC",
    args: [],
  });
  return result.rows as unknown as Event[];
}

export async function getEventById(id: number): Promise<Event | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, name, status, created_at FROM events WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Event;
}

export async function getMatchesByEvent(eventId: number): Promise<Match[]> {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT id, event_id, team_a, team_b, match_time, winner, status 
          FROM matches WHERE event_id = ? ORDER BY match_time DESC`,
    args: [eventId],
  });
  return result.rows as unknown as Match[];
}

export async function getMatchById(id: number): Promise<Match | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, event_id, team_a, team_b, match_time, winner, status FROM matches WHERE id = ?',
    args: [id],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Match;
}

export async function getRegistration(eventId: number, userId: number): Promise<EventRegistration | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, event_id, user_id, coins, status FROM event_registrations WHERE event_id = ? AND user_id = ?',
    args: [eventId, userId],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as EventRegistration;
}

export async function getAllEventRegistrations(): Promise<
  {
    id: number;
    event_id: number;
    event_name: string;
    user_id: number;
    username: string;
    coins: number;
    status: EventRegistrationStatus;
  }[]
> {
  const db = getClient();
  const result = await db.execute(`
    SELECT er.id, er.event_id, e.name AS event_name, er.user_id, u.username, er.coins, er.status
    FROM event_registrations er
    JOIN events e ON er.event_id = e.id
    JOIN users u ON er.user_id = u.id
    ORDER BY er.id DESC
  `);
  return result.rows as unknown as {
    id: number;
    event_id: number;
    event_name: string;
    user_id: number;
    username: string;
    coins: number;
    status: EventRegistrationStatus;
  }[];
}

export async function getBetForMatch(matchId: number, userId: number): Promise<Bet | null> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, match_id, user_id, team_chosen, amount, placed_at FROM bets WHERE match_id = ? AND user_id = ?',
    args: [matchId, userId],
  });
  if (result.rows.length === 0) return null;
  return result.rows[0] as unknown as Bet;
}

export async function getBetsForMatch(matchId: number): Promise<Bet[]> {
  const db = getClient();
  const result = await db.execute({
    sql: 'SELECT id, match_id, user_id, team_chosen, amount, placed_at FROM bets WHERE match_id = ?',
    args: [matchId],
  });
  return result.rows as unknown as Bet[];
}

export async function getBetsByEvent(eventId: number): Promise<Bet[]> {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT b.id, b.match_id, b.user_id, b.team_chosen, b.amount, b.placed_at
          FROM bets b
          JOIN matches m ON b.match_id = m.id
          WHERE m.event_id = ?`,
    args: [eventId],
  });
  return result.rows as unknown as Bet[];
}

export async function getLeaderboard(eventId: number): Promise<LeaderboardEntry[]> {
  const db = getClient();
  const result = await db.execute({
    sql: `SELECT u.id AS user_id, u.username, er.coins 
          FROM event_registrations er 
          JOIN users u ON er.user_id = u.id 
          WHERE er.event_id = ? 
          ORDER BY er.coins DESC, u.username ASC`,
    args: [eventId],
  });
  return result.rows as unknown as LeaderboardEntry[];
}

export async function getAllUsers(): Promise<{ id: number; username: string; role: string }[]> {
  const db = getClient();
  const result = await db.execute('SELECT id, username, role FROM users ORDER BY username ASC');
  return result.rows as unknown as { id: number; username: string; role: string }[];
}
