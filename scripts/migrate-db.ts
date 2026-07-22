import { resolve } from 'node:path';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';

async function migrateDatabase() {
  const provider = process.env.DATABASE_PROVIDER || 'sqlite';
  if (provider !== 'sqlite' && provider !== 'turso') {
    throw new Error(
      `The runtime migration CLI only supports sqlite and turso, received: ${provider}`
    );
  }

  const url = process.env.DATABASE_URL || 'file:data/local.db';
  const migrationsFolder =
    process.env.MIGRATIONS_FOLDER || resolve(process.cwd(), 'drizzle');
  const client = createClient({
    url,
    authToken: process.env.DATABASE_AUTH_TOKEN,
  });

  try {
    console.log(`Database provider: ${provider}`);
    console.log(`Migrations folder: ${migrationsFolder}`);
    await migrate(drizzle({ client }), { migrationsFolder });
    console.log('Database migrations complete.');
  } finally {
    client.close();
  }
}

migrateDatabase().catch((error) => {
  console.error(error);
  process.exit(1);
});
