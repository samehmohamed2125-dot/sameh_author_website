// Run only in a trusted local/dev environment with DATABASE_URL configured.
// Never print the connection string or credentials.
import { checkReaderDatabase, closeReaderPool } from '../src/reader-db.js';

try {
  const connected = await checkReaderDatabase();
  if (!connected) throw new Error('Unexpected database response');
  console.log('Neon reader database: connection OK');
} catch (error) {
  console.error('Neon reader database: connection FAILED');
  console.error(error.code || error.message);
  process.exitCode = 1;
} finally {
  await closeReaderPool().catch(() => {});
}
