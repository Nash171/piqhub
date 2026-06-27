import { createClient, Client } from '@libsql/client';

const url = process.env.TURSO_DATABASE_URL ?? '';
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  throw new Error('TURSO_DATABASE_URL is not set');
}

let client: Client;

export function getClient(): Client {
  if (!client) {
    client = createClient({ url, authToken });
  }
  return client;
}

export function isLocalDatabase(): boolean {
  return url.startsWith('file:');
}

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'player' CHECK(role IN ('admin', 'player')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'open', 'locked', 'completed', 'hidden')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS matches (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  team_a TEXT NOT NULL,
  team_b TEXT NOT NULL,
  match_time DATETIME NOT NULL,
  winner TEXT CHECK(winner IN ('team_a', 'team_b')),
  status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'locked', 'completed')),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS event_registrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  coins INTEGER NOT NULL DEFAULT 1000,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'blocked')),
  UNIQUE(event_id, user_id)
);

CREATE TABLE IF NOT EXISTS bets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id INTEGER NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  team_chosen TEXT NOT NULL CHECK(team_chosen IN ('team_a', 'team_b')),
  amount INTEGER NOT NULL,
  placed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(match_id, user_id)
);
`;

export async function setupDatabase() {
  const db = getClient();
  await db.executeMultiple(SCHEMA_SQL);
}
