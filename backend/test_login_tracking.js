const pool = require("./models/db");

async function testLogin() {
  console.log("🧪 Testing login activity tracking with login_events table...\n");
  
  try {
    // 1. Check today's data with timezone from login_events
    console.log("1. Checking today's data with timezone from login_events:");
    
    const todayUTC = await pool.query(`
      SELECT COUNT(*) as count FROM login_events 
      WHERE DATE(login_time) = CURRENT_DATE
    `);
    
    const todayBD = await pool.query(`
      SELECT COUNT(*) as count FROM login_events 
      WHERE DATE(login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dhaka') = CURRENT_DATE
    `);
    
    console.log("Today's data (UTC timezone):", todayUTC.rows[0]);
    console.log("Today's data (Bangladesh timezone):", todayBD.rows[0]);
    
    // 2. Show recent data from login_events
    console.log("\n2. Recent login_events (last 10):");
    const recent = await pool.query(`
      SELECT 
        login_time,
        login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dhaka' as bd_time,
        role,
        name,
        identifier
      FROM login_events 
      ORDER BY login_time DESC 
      LIMIT 10
    `);
    
    if (recent.rows.length === 0) {
      console.log("❌ No login events found in the database");
    } else {
      recent.rows.forEach((row, i) => {
        console.log(`${i+1}. ${row.bd_time} (BD) | ${row.role} | ${row.name} | ${row.identifier}`);
      });
    }
    
    // 3. Check yesterday's data
    console.log("\n3. Yesterday's login events:");
    const yesterday = await pool.query(`
      SELECT COUNT(*) as count FROM login_events 
      WHERE DATE(login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dhaka') = CURRENT_DATE - INTERVAL '1 day'
    `);
    console.log("Yesterday's data:", yesterday.rows[0]);
    
    // 4. Test new login insert
    console.log("\n4. Testing new login insert:");
    const testUserId = 'test-user-' + Date.now();
    const testInsert = await pool.query(`
      INSERT INTO login_events (
        user_id, role, identifier, name, ip_address, user_agent, platform, is_mobile
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *
    `, [
      testUserId,
      'student',
      'TEST-ROLL-' + Date.now(),
      'Test Student Today',
      '127.0.0.1',
      'Test User Agent',
      'Test Platform',
      false
    ]);
    
    console.log("✅ Test login inserted:", testInsert.rows[0]);
    
    // 5. Check today's count again
    console.log("\n5. Today's count after test insert:");
    const todayAfter = await pool.query(`
      SELECT COUNT(*) as count FROM login_events 
      WHERE DATE(login_time AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Dhaka') = CURRENT_DATE
    `);
    console.log("Today's data after insert:", todayAfter.rows[0]);
    
    // 6. Clean up test data
    console.log("\n6. Cleaning up test data...");
    await pool.query(`DELETE FROM login_events WHERE user_id = $1`, [testUserId]);
    console.log("✅ Test data cleaned up");
    
  } catch (error) {
    console.error("❌ Test error:", error);
  } finally {
    process.exit(0);
  }
}

testLogin();