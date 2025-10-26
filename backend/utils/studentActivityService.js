/**
 * Student Activity Tracking Service
 * Handles logging of student logins and PDF downloads
 */

const pool = require('../models/db');

class StudentActivityService {
  
  /**
   * Log student login activity
   * @param {Object} loginData - Login information
   * @param {string} loginData.studentId - Student ID
   * @param {string} loginData.rollNumber - Student roll number
   * @param {string} loginData.studentName - Student name
   * @param {string} loginData.ipAddress - Client IP address
   * @param {string} loginData.userAgent - User agent string
   * @param {Object} loginData.deviceInfo - Additional device information
   */
  static async logStudentLogin(loginData) {
    try {
      const {
        studentId,
        rollNumber,
        studentName,
        ipAddress,
        userAgent,
        deviceInfo = {}
      } = loginData;

      const query = `
        INSERT INTO student_login_logs 
        (student_id, roll_number, student_name, ip_address, user_agent, device_info)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, login_time
      `;
      
      const values = [
        studentId,
        rollNumber,
        studentName,
        ipAddress,
        userAgent,
        JSON.stringify(deviceInfo)
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Logged student login: ${rollNumber} at ${result.rows[0].login_time}`);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error logging student login:', error);
      throw error;
    }
  }

  /**
   * Log PDF download activity
   * @param {Object} downloadData - Download information
   * @param {string} downloadData.studentId - Student ID (optional for guest downloads)
   * @param {string} downloadData.rollNumber - Student roll number
   * @param {string} downloadData.studentName - Student name
   * @param {string} downloadData.pdfType - Type of PDF (admit_card, question_paper, etc.)
   * @param {string} downloadData.fileName - Downloaded file name
   * @param {string} downloadData.ipAddress - Client IP address
   * @param {string} downloadData.userAgent - User agent string
   * @param {number} downloadData.fileSize - File size in bytes
   * @param {boolean} downloadData.success - Download success status
   * @param {string} downloadData.errorMessage - Error message if download failed
   */
  static async logPDFDownload(downloadData) {
    try {
      const {
        studentId = null,
        rollNumber,
        studentName,
        pdfType,
        fileName,
        ipAddress,
        userAgent,
        fileSize = null,
        success = true,
        errorMessage = null
      } = downloadData;

      const query = `
        INSERT INTO pdf_download_logs 
        (student_id, roll_number, student_name, pdf_type, file_name, 
         ip_address, user_agent, file_size, success, error_message)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, download_time
      `;
      
      const values = [
        studentId,
        rollNumber,
        studentName,
        pdfType,
        fileName,
        ipAddress,
        userAgent,
        fileSize,
        success,
        errorMessage
      ];

      const result = await pool.query(query, values);
      console.log(`✅ Logged PDF download: ${pdfType} for ${rollNumber} at ${result.rows[0].download_time}`);
      
      return result.rows[0];
    } catch (error) {
      console.error('❌ Error logging PDF download:', error);
      throw error;
    }
  }

  /**
   * Update daily analytics summary
   * @param {Date} date - Target date (defaults to today)
   */
  static async updateDailyAnalytics(date = null) {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      
      const query = 'SELECT update_daily_analytics($1)';
      await pool.query(query, [targetDate]);
      
      console.log(`✅ Updated daily analytics for ${targetDate}`);
    } catch (error) {
      console.error('❌ Error updating daily analytics:', error);
      throw error;
    }
  }

  /**
   * Get student login statistics
   * @param {Object} options - Query options
   * @param {Date} options.startDate - Start date filter
   * @param {Date} options.endDate - End date filter
   * @param {string} options.rollNumber - Specific student filter
   * @param {number} options.limit - Limit results
   */
  static async getLoginStats(options = {}) {
    try {
      const {
        startDate,
        endDate,
        rollNumber,
        limit = 100
      } = options;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`login_time >= $${paramIndex}`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`login_time <= $${paramIndex}`);
        queryParams.push(endDate);
        paramIndex++;
      }

      if (rollNumber) {
        whereConditions.push(`roll_number = $${paramIndex}`);
        queryParams.push(rollNumber);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          id,
          roll_number,
          student_name,
          ip_address,
          login_time,
          session_duration,
          device_info
        FROM student_login_logs
        ${whereClause}
        ORDER BY login_time DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);
      const result = await pool.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting login stats:', error);
      throw error;
    }
  }

  /**
   * Get PDF download statistics
   * @param {Object} options - Query options
   */
  static async getPDFDownloadStats(options = {}) {
    try {
      const {
        startDate,
        endDate,
        rollNumber,
        pdfType,
        limit = 100
      } = options;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`download_time >= $${paramIndex}`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`download_time <= $${paramIndex}`);
        queryParams.push(endDate);
        paramIndex++;
      }

      if (rollNumber) {
        whereConditions.push(`roll_number = $${paramIndex}`);
        queryParams.push(rollNumber);
        paramIndex++;
      }

      if (pdfType) {
        whereConditions.push(`pdf_type = $${paramIndex}`);
        queryParams.push(pdfType);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          id,
          roll_number,
          student_name,
          pdf_type,
          file_name,
          download_time,
          success,
          ip_address
        FROM pdf_download_logs
        ${whereClause}
        ORDER BY download_time DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);
      const result = await pool.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting PDF download stats:', error);
      throw error;
    }
  }

  /**
   * Get analytics summary
   * @param {Object} options - Query options
   */
  static async getAnalyticsSummary(options = {}) {
    try {
      const {
        startDate,
        endDate,
        limit = 30
      } = options;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`date >= $${paramIndex}`);
        queryParams.push(startDate);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`date <= $${paramIndex}`);
        queryParams.push(endDate);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          date,
          total_logins,
          unique_students,
          total_pdf_downloads,
          admit_card_downloads,
          question_paper_downloads,
          scholarship_downloads,
          result_downloads
        FROM student_analytics_summary
        ${whereClause}
        ORDER BY date DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);
      const result = await pool.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting analytics summary:', error);
      throw error;
    }
  }

  /**
   * Get daily analytics data
   * @param {Object} options - Query options
   */
  static async getDailyAnalytics(options = {}) {
    try {
      const {
        startDate,
        endDate,
        limit = 30
      } = options;

      let whereConditions = [];
      let queryParams = [];
      let paramIndex = 1;

      if (startDate) {
        whereConditions.push(`date >= $${paramIndex}`);
        queryParams.push(startDate.toISOString().split('T')[0]);
        paramIndex++;
      }

      if (endDate) {
        whereConditions.push(`date <= $${paramIndex}`);
        queryParams.push(endDate.toISOString().split('T')[0]);
        paramIndex++;
      }

      const whereClause = whereConditions.length > 0 
        ? `WHERE ${whereConditions.join(' AND ')}`
        : '';

      const query = `
        SELECT 
          date,
          total_logins,
          unique_students,
          total_pdf_downloads,
          admit_card_downloads,
          question_paper_downloads,
          scholarship_downloads,
          result_downloads
        FROM student_analytics_summary
        ${whereClause}
        ORDER BY date DESC
        LIMIT $${paramIndex}
      `;

      queryParams.push(limit);
      const result = await pool.query(query, queryParams);
      
      return result.rows;
    } catch (error) {
      console.error('❌ Error getting daily analytics:', error);
      throw error;
    }
  }

  /**
   * Get real-time dashboard statistics
   */
  static async getDashboardStats() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      const queries = await Promise.all([
        // Today's stats
        pool.query(`
          SELECT 
            COUNT(*) as total_logins,
            COUNT(DISTINCT student_id) as unique_students
          FROM student_login_logs 
          WHERE DATE(login_time) = $1
        `, [today]),

        // Today's PDF downloads
        pool.query(`
          SELECT 
            COUNT(*) as total_downloads,
            COUNT(*) FILTER (WHERE pdf_type = 'admit_card') as admit_card_downloads
          FROM pdf_download_logs 
          WHERE DATE(download_time) = $1
        `, [today]),

        // Yesterday's stats for comparison
        pool.query(`
          SELECT 
            COUNT(*) as total_logins,
            COUNT(DISTINCT student_id) as unique_students
          FROM student_login_logs 
          WHERE DATE(login_time) = $1
        `, [yesterday]),

        // Total students in system
        pool.query(`SELECT COUNT(*) as total_students FROM students`),

        // Most active students today
        pool.query(`
          SELECT 
            roll_number,
            student_name,
            COUNT(*) as login_count
          FROM student_login_logs 
          WHERE DATE(login_time) = $1
          GROUP BY roll_number, student_name
          ORDER BY login_count DESC
          LIMIT 10
        `, [today])
      ]);

      return {
        today: {
          logins: parseInt(queries[0].rows[0].total_logins),
          uniqueStudents: parseInt(queries[0].rows[0].unique_students),
          pdfDownloads: parseInt(queries[1].rows[0].total_downloads),
          admitCardDownloads: parseInt(queries[1].rows[0].admit_card_downloads)
        },
        yesterday: {
          logins: parseInt(queries[2].rows[0].total_logins),
          uniqueStudents: parseInt(queries[2].rows[0].unique_students)
        },
        totalStudents: parseInt(queries[3].rows[0].total_students),
        mostActiveStudents: queries[4].rows
      };
    } catch (error) {
      console.error('❌ Error getting dashboard stats:', error);
      throw error;
    }
  }
}

module.exports = StudentActivityService;
