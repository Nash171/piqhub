import { pathToFileURL } from 'url';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export async function migrateActiveToOpen(): Promise<void> {
  const { getClient } = await import('../src/lib/db');
  const db = getClient();

  // Check whether the events table already has the new status constraint.
  const tableInfo = await db.execute({
    sql: "SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'events'",
    args: [],
  });

  if (tableInfo.rows.length === 0) {
    console.log('No events table found. Nothing to migrate.');
    return;
  }

  const schemaSql = (tableInfo.rows[0].sql as string) ?? '';
  if (schemaSql.includes("'open'") && schemaSql.includes("'hidden'")) {
    console.log('Events table already has the new status constraint. Nothing to migrate.');
    return;
  }

  // Recreate the events table with the new status constraint, preserving
  // existing rows and migrating any legacy 'active' rows to 'open'.
  // legacy_alter_table keeps foreign key references pointing to the table
  // name 'events' so dependent tables still work after the rename/drop.
  await db.execute('PRAGMA foreign_keys=OFF');
  await db.execute('PRAGMA legacy_alter_table=ON');

  await db.execute('ALTER TABLE events RENAME TO events_old');

  await db.execute(`
    CREATE TABLE events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'upcoming' CHECK(status IN ('upcoming', 'open', 'locked', 'completed', 'hidden')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await db.execute(`
    INSERT INTO events (id, name, status, created_at)
    SELECT id, name, CASE WHEN status = 'active' THEN 'open' ELSE status END, created_at
    FROM events_old
  `);

  await db.execute('DROP TABLE events_old');

  await db.execute('PRAGMA legacy_alter_table=OFF');
  await db.execute('PRAGMA foreign_keys=ON');

  const result = await db.execute({
    sql: "SELECT id, name, status FROM events WHERE status = 'open'",
    args: [],
  });

  console.log(`Migration complete. ${result.rows.length} event(s) now have status 'open'.`);
}

async function main() {
  await migrateActiveToOpen();
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
}
