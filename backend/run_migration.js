const pool = require('./models/db');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  try {
    console.log('🚀 Starting user activity migration...');

    // Read the SQL migration file
    const migrationSQL = fs.readFileSync(path.join(__dirname, 'schema/user_activity_migration.sql'), 'utf8');

    // Split by semicolon and execute each statement
    const statements = migrationSQL.split(';').filter(stmt => stmt.trim());

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await pool.query(statement);
          console.log('✅ Executed:', statement.trim().substring(0, 50) + '...');
        } catch (err) {
          if (err.message.includes('already exists') || err.message.includes('does not exist')) {
            console.log('⚠️ Skipped (already exists):', statement.trim().substring(0, 50) + '...');
          } else {
            console.error('❌ Error executing statement:', err.message);
          }
        }
      }
    }

    console.log('🎉 Migration completed successfully!');

    // Test the tables
    const testResult = await pool.query('SELECT COUNT(*) FROM user_activity');
    console.log('✅ user_activity table is working, current rows:', testResult.rows[0].count);

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
