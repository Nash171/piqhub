import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function assertEqual(actual: unknown, expected: unknown, message: string) {
  if (actual !== expected) {
    throw new Error(`${message}: expected ${expected}, got ${actual}`);
  }
}

async function main() {
  const { getClient } = await import('../src/lib/db');
  const { createUser } = await import('../src/lib/auth');
  const {
    createEventLogic,
    createMatchLogic,
    registerForEventLogic,
    placeBetLogic,
    setMatchWinnerLogic,
  } = await import('../src/lib/betting');
  const { getLeaderboard, getRegistration } = await import('../src/lib/queries');

  const db = getClient();
  await db.execute('DELETE FROM bets');
  await db.execute('DELETE FROM event_registrations');
  await db.execute('DELETE FROM matches');
  await db.execute('DELETE FROM events');
  await db.execute("DELETE FROM users WHERE role = 'player'");

  const playerA = await createUser('playera', 'password123', 'player');
  const playerB = await createUser('playerb', 'password123', 'player');
  const playerC = await createUser('playerc', 'password123', 'player');

  const event = await createEventLogic('PiqHub Test', 'open');

  await registerForEventLogic(playerA.id, event.id);
  await registerForEventLogic(playerB.id, event.id);
  await registerForEventLogic(playerC.id, event.id);

  // Confirm registrations so users can place bets
  await db.execute({
    sql: "UPDATE event_registrations SET status = 'confirmed' WHERE event_id = ?",
    args: [event.id],
  });

  let regA = await getRegistration(event.id, playerA.id);
  let regB = await getRegistration(event.id, playerB.id);
  let regC = await getRegistration(event.id, playerC.id);
  await assertEqual(regA?.coins, 1000, 'Player A starting coins');
  await assertEqual(regB?.coins, 1000, 'Player B starting coins');
  await assertEqual(regC?.coins, 1000, 'Player C starting coins');

  const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const match = await createMatchLogic(event.id, 'Brazil', 'Japan', futureTime);

  await placeBetLogic(playerA.id, match.id, 'team_a', 100);
  await placeBetLogic(playerB.id, match.id, 'team_b', 50);
  await placeBetLogic(playerC.id, match.id, 'team_a', 25);

  regA = await getRegistration(event.id, playerA.id);
  regB = await getRegistration(event.id, playerB.id);
  regC = await getRegistration(event.id, playerC.id);
  await assertEqual(regA?.coins, 900, 'Player A after bet');
  await assertEqual(regB?.coins, 950, 'Player B after bet');
  await assertEqual(regC?.coins, 975, 'Player C after bet');

  // Move match time to past to simulate match completion
  await db.execute({
    sql: "UPDATE matches SET match_time = ? WHERE id = ?",
    args: [new Date(Date.now() - 60 * 60 * 1000).toISOString(), match.id],
  });

  await setMatchWinnerLogic(match.id, 'team_a');

  regA = await getRegistration(event.id, playerA.id);
  regB = await getRegistration(event.id, playerB.id);
  regC = await getRegistration(event.id, playerC.id);

  await assertEqual(regA?.coins, 1040, 'Player A after payout');
  await assertEqual(regB?.coins, 950, 'Player B after payout');
  await assertEqual(regC?.coins, 1010, 'Player C after payout');

  const leaderboard = await getLeaderboard(event.id);
  console.log('Leaderboard:', leaderboard);

  console.log('All tests passed!');
}

main().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
