// Reader-only PostgreSQL connection helper.
// Not imported by the public website until reader authentication is implemented.
// DATABASE_URL must be stored in a secret environment variable, never in Git.
let poolPromise;

export async function getReaderPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is missing. Configure the reader-development Neon connection securely.');
  }
  if (!poolPromise) {
    poolPromise = import('pg')
      .then(({ default: pg }) => new pg.Pool({
        connectionString: process.env.DATABASE_URL,
        max: 3,
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      }))
      .catch(error => {
        poolPromise = undefined;
        throw error;
      });
  }
  return poolPromise;
}

export async function checkReaderDatabase() {
  const pool = await getReaderPool();
  const result = await pool.query('SELECT 1 AS connected');
  return result.rows[0]?.connected === 1;
}

export async function closeReaderPool() {
  if (!poolPromise) return;
  const pool = await poolPromise;
  poolPromise = undefined;
  await pool.end();
}
