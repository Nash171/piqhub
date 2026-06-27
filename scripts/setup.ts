import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function main() {
  const { setupDatabase } = await import('../src/lib/db');
  await setupDatabase();
  console.log('Database tables created successfully');
}

main().catch((error) => {
  console.error('Setup failed:', error);
  process.exit(1);
});
