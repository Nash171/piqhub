import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export async function migrateRegistrationStatus(): Promise<void> {
  const { getClient } = await import('../src/lib/db');
  const db = getClient();

  // Check whether the event_registrations table already has the status column.
  const tableInfo = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'event_registrations'",
    args: [],
  });

  if (tableInfo.rows.length === 0) {
    console.log('No event_registrations table found. Nothing to migrate.');
    return;
  }

  const schemaSql = (tableInfo.rows[0].sql as string) ?? '';
  if (schemaSql.includes('status')) {
    console.log('event_registrations already has status column. Setting existing rows to confirmed.');
    const result = await db.execute({
      sql: "UPDATE event_registrations SET status = 'confirmed' WHERE status != 'confirmed'",
      args: [],
    });
    console.log(`Updated ${result.rowsAffected} registration(s) to confirmed.`);
    return;
  }

  // Recreate the event_registrations table with the status column and migrate
  // existing rows to 'confirmed'.
  await db.execute('PRAGMA foreign_keys=OFF');
  await db.execute('PRAGMA legacy_alter_table=ON');

  await db.execute('ALTER TABLE event_registrations RENAME TO event_registrations_old');

  await db.execute(`
    CREATE TABLE event_registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      coins INTEGER NOT NULL DEFAULT 1000,
      status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'rejected', 'blocked')),
      UNIQUE(event_id, user_id)
    )
  `);

  await db.execute(`
    INSERT INTO event_registrations (id, event_id, user_id, coins, status)
    SELECT id, event_id, user_id, coins, 'confirmed'
    FROM event_registrations_old
  `);

  await db.execute('DROP TABLE event_registrations_old');

  await db.execute('PRAGMA legacy_alter_table=OFF');
  await db.execute('PRAGMA foreign_keys=ON');

  console.log('Migration complete. Existing registrations set to confirmed.');
}

async function main() {
  await migrateRegistrationStatus();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
