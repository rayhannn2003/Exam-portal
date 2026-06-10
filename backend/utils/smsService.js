const axios = require("axios");
require("dotenv").config();

class SMSNotificationService {
  constructor() {
    const defaultSingle = "http://bulksmsbd.net/api/smsapi";
    const defaultMany = "http://bulksmsbd.net/api/smsapimany";

    this.smsApiUrl = process.env.BULKSMSBD_SMS_API_URL || defaultSingle;
    this.smsApiManyUrl =
     process.env.BULKSMSBD_SMS_API_URL_MANY || process.env.BULKSMSBD_SMSAPIMANY_URL || defaultMany;
    this.balanceApiUrl = process.env.BULKSMSBD_BALANCE_API_URL || "";
    this.apiKey = process.env.BULKSMSBD_API_KEY || "";
    this.senderId = process.env.BULKSMSBD_SENDER_ID || "";

    this.http = axios.create({ timeout: 10000 });

    this.validateEnv();
  }

  validateEnv() {
    const missing = [];
    if (!this.smsApiUrl) missing.push("BULKSMSBD_SMS_API_URL");
    if (!this.smsApiManyUrl) missing.push("BULKSMSBD_SMS_API_URL_MANY");
    if (!this.balanceApiUrl) missing.push("BULKSMSBD_BALANCE_API_URL");
    if (!this.apiKey) missing.push("BULKSMSBD_API_KEY");
    if (!this.senderId) missing.push("BULKSMSBD_SENDER_ID");
    if (missing.length) {
      console.warn(
        `SMS service environment not fully configured. Missing: ${missing.join(", ")}`
      );
    }
  }

  // Normalize to provider-required 8801XXXXXXXXX format
  normalizeNumber(num) {
    if (!num) return null;
    const trimmed = String(num).trim();
    const cleaned = trimmed.replace(/[^0-9+]/g, "");

    if (/^\+?8801\d{9}$/.test(cleaned)) {
      return cleaned.replace(/^\+/, "");
    }
    if (/^01\d{9}$/.test(cleaned)) {
      return `88${cleaned}`;
    }
    if (/^8801\d{9}$/.test(cleaned)) {
      return cleaned;
    }
    if (/^\+8801\d{9}$/.test(cleaned)) {
      return cleaned.replace(/^\+/, "");
    }
    return null;
  }

  async sendSMS(to, message, options = {}) {
    try {
      const recipients = Array.isArray(to) ? to : [to];
      const normalized = recipients
        .map((n) => this.normalizeNumber(n))
        .filter((n) => !!n);
      if (!normalized.length) {
        return { success: false, error: "Invalid recipient number format" };
      }

      const body = {
        api_key: this.apiKey,
        senderid: options.senderIdOverride || this.senderId,
        number: normalized.join(","),
        message,
      };
      if (options.unicode) body.type = "unicode";

      const response = await this.http.post(this.smsApiUrl, body, {
        timeout: options.timeoutMs ?? 10000,
      });
      if (response?.data?.response_code === 202) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.data };
    } catch (error) {
      const msg = error?.response?.data || error?.message || "Unknown SMS error";
      return { success: false, error: msg };
    }
  }

  /** Many-to-many: different messages for different recipients in a single request */
  async sendBulkDifferentMessages(messages, options = {}) {
    try {
      const prepared = (messages || [])
        .map((m) => {
          const to = this.normalizeNumber(m.to);
          if (!to || !m.message) return null;
          return { to, message: m.message };
        })
        .filter((m) => !!m);

      if (!prepared.length) {
        return { success: false, error: "No valid messages to send" };
      }

      const body = {
        api_key: this.apiKey,
        senderid: options.senderIdOverride || this.senderId,
        messages: prepared,
      };
      if (options.unicode) body.type = "unicode";

      const response = await this.http.post(this.smsApiManyUrl, body, {
        timeout: options.timeoutMs ?? 10000,
      });

      if (response?.data?.response_code === 202) {
        return { success: true, data: response.data };
      }
      return { success: false, error: response?.data };
    } catch (error) {
      const msg = error?.response?.data || error?.message || "Unknown SMS error";
      return { success: false, error: msg };
    }
  }

  /** Same message to many recipients */
  async sendBulkSMS(recipients, message, options = {}) {
    const normalized = (recipients || [])
      .map((n) => this.normalizeNumber(n))
      .filter((n) => !!n);
    const unique = Array.from(new Set(normalized));
    if (!unique.length) {
      return { total: 0, success: 0, failed: 0, results: [] };
    }
    const single = await this.sendSMS(unique, message, options);
    return {
      total: unique.length,
      success: single.success ? unique.length : 0,
      failed: single.success ? 0 : unique.length,
      results: [single],
    };
  }
  // Bengali registration confirmation for student
  async sendStudentRegistrationSMS({ to, name, schoolName, rollNumber, portalUrl,password }) {
    const site = portalUrl || process.env.PORTAL_URL || process.env.FRONTEND_URL || "http://localhost:5173";
    const message = `Dear Student, your registration for UTCKS Scholarship Exam is successful. Roll: ${rollNumber}, Pass: ${password}. Download admit card: www.utcks.daftar-e.com`;
    return this.sendSMS(to, message, { unicode: true });
  }
}

module.exports = new SMSNotificationService();
