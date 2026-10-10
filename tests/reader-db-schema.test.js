import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('reader database schema enforces ownership and payment boundaries', async () => {
  const sql = await readFile(new URL('../db/migrations/001_reader_accounts.sql', import.meta.url), 'utf8');
  for (const table of ['reader_users','reader_sessions','reader_orders','reader_entitlements','reader_payment_events']) {
    assert.match(sql, new RegExp('CREATE TABLE IF NOT EXISTS ' + table + '\\b'));
  }
  assert.match(sql, /amount_minor integer NOT NULL CHECK \(amount_minor = 40000\)/);
  assert.match(sql, /currency char\(3\) NOT NULL CHECK \(currency = 'EGP'\)/);
  assert.match(sql, /PRIMARY KEY \(user_id, book_id\)/);
  assert.match(sql, /PRIMARY KEY \(provider, event_id\)/);
  assert.match(sql, /token_hash char\(64\) PRIMARY KEY/);
  assert.doesNotMatch(sql, /CREATE TABLE IF NOT EXISTS (?:book_chapters|manuscript)/);
});
