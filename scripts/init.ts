import dotenv from 'dotenv';
import { existsSync } from 'fs';

if (existsSync('.env.local')) {
  dotenv.config({ path: '.env.local' });
}

async function main() {
  const { setupDatabase } = await import('../src/lib/db');
  const { getUserByUsername, createUser } = await import('../src/lib/auth');

  await setupDatabase();
  console.log('Database tables created successfully');

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.log('ADMIN_USERNAME and/or ADMIN_PASSWORD not set; skipping admin seed');
    return;
  }

  const existing = await getUserByUsername(adminUsername);
  if (existing) {
    console.log(`Admin user "${adminUsername}" already exists`);
    return;
  }

  await createUser(adminUsername, adminPassword, 'admin');
  console.log(`Admin user "${adminUsername}" created successfully`);
}

main().catch((error) => {
  console.error('Init failed:', error);
  process.exit(1);
});
