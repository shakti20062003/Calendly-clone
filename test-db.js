require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

console.log('Testing connection...');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL not found in .env.local!');
  console.log('\nChecking .env.local file location...');
  console.log('Current directory:', process.cwd());
  process.exit(1);
}

console.log('Connection string:', process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@'));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Failed:', err.message);
    console.error('Full error:', err);
  } else {
    console.log('✅ Success!', res.rows[0]);
  }
  pool.end();
});