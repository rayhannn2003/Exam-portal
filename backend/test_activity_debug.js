const pool = require("./models/db");

async function debugActivityTables() {
  console.log("🔍 Debugging User Activity Tracking...\n");
  
  try {
    // Check if tables exist
    console.log("1. Checking if tables exist:");
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('user_activity', 'login_events')
    `);
    console.log("Existing tables:", tablesResult.rows);
    
    // Check if trigger function exists
    console.log("\n2. Checking trigger function:");
    const triggerFuncResult = await pool.query(`
      SELECT routine_name 
      FROM information_schema.routines 
      WHERE routine_name = 'log_user_activity'
    `);
    console.log("Trigger function exists:", triggerFuncResult.rows);
    
    // Check if trigger exists
    console.log("\n3. Checking trigger:");
    const triggerResult = await pool.query(`
      SELECT trigger_name, event_object_table 
      FROM information_schema.triggers 
      WHERE trigger_name = 'trg_log_user_activity'
    `);
    console.log("Trigger exists:", triggerResult.rows);
    
    // Check recent login_events
    console.log("\n4. Recent login_events (last 3 days):");
    const eventsResult = await pool.query(`
      SELECT * FROM login_events 
      WHERE login_time >= NOW() - INTERVAL '3 days'
      ORDER BY login_time DESC 
      LIMIT 10
    `);
    console.log("Recent login events:", eventsResult.rows);
    
    // Check recent user_activity
    console.log("\n5. Recent user_activity (last 3 days):");
    const activityResult = await pool.query(`
      SELECT * FROM user_activity 
      WHERE login_time >= NOW() - INTERVAL '3 days'
      ORDER BY login_time DESC 
      LIMIT 10
    `);
    console.log("Recent user activity:", activityResult.rows);
    
    // Check today's activity specifically
    console.log("\n6. Today's activity:");
    const todayResult = await pool.query(`
      SELECT DATE(login_time) as date, COUNT(*) as count, role
      FROM user_activity 
      WHERE DATE(login_time) = CURRENT_DATE
      GROUP BY DATE(login_time), role
    `);
    console.log("Today's activity by role:", todayResult.rows);
    
    // Test manual insert into login_events
    console.log("\n7. Testing manual insert into login_events:");
    const testInsert = await pool.query(`
      INSERT INTO login_events (
        user_id, role, identifier, name, ip_address, user_agent, platform, is_mobile
      ) VALUES (
        'test-id', 'student', 'test-roll', 'Test Student', '127.0.0.1', 'Test Agent', 'Test Platform', false
      ) RETURNING *
    `);
    console.log("Test insert result:", testInsert.rows[0]);
    
    // Check if it was automatically copied to user_activity
    console.log("\n8. Checking if trigger worked:");
    const triggerCheck = await pool.query(`
      SELECT * FROM user_activity 
      WHERE identifier = 'test-roll' 
      ORDER BY login_time DESC 
      LIMIT 1
    `);
    console.log("Trigger result:", triggerCheck.rows);
    
    // Clean up test data
    await pool.query(`DELETE FROM login_events WHERE identifier = 'test-roll'`);
    await pool.query(`DELETE FROM user_activity WHERE identifier = 'test-roll'`);
    
  } catch (error) {
    console.error("❌ Debug error:", error);
  } finally {
    process.exit(0);
  }
}

debugActivityTables();