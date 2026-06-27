import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { getUserByUsername, createUser } = await import('../src/lib/auth');

  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('ADMIN_USERNAME and ADMIN_PASSWORD env vars are required');
    process.exit(1);
  }

  const existing = await getUserByUsername(adminUsername);
  if (existing) {
    console.log('Admin user already exists');
    return;
  }

  await createUser(adminUsername, adminPassword, 'admin');
  console.log(`Admin user "${adminUsername}" created successfully`);
}

main().catch((error) => {
  console.error('Seed failed:', error);
  process.exit(1);
});
