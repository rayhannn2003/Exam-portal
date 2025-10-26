import axios from "axios";

// Base URL of your backend API
const API_BASE_URL = "https://examapi.daftar-e.com/api";
//"https://examapi.daftar-e.com/api"; // Updated to match your backend PORT
// Base URL of Flask PDF service (admit card)
const FLASK_PDF_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_FLASK_PDF_URL) || "https://ahmfuad.pythonanywhere.com"; //"localhost:8000";

// Create an Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


// ----- Auth APIs -----
export const loginStudent = async (credentials) => {
  try {
    const res = await api.post("/students/login", credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

export const loginAdmin = async (credentials) => {
  try {
    const res = await api.post("/admin/login", credentials);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Login failed" };
  }
};

export const getAdminNameByUsername = async (username) => {
  try {
    const res = await api.get(`/admin/name/${encodeURIComponent(username)}`);
    return res.data; // { name }
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch admin name" };
  }
};
//admin register
export const registerAdmin = async (data) => {
  try {
    const res = await api.post("/admin/register", data);//http://localhost:4000/api/admin/register
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Registration failed" };
  }
};

export const registerStudent = async (data) => {
  try {
    const res = await api.post("/students/register", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Registration failed" };
  }
};

export const changeStudentPassword = async ({ roll_number, old_password, new_password }) => {
  try {
    const res = await api.post('/students/change-password', { roll_number, old_password, new_password });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.error || err?.response?.data?.message || 'Failed to change password';
    throw { status, message };
  }
};

export const verifyStudentPassword = async ({ roll_number, old_password }) => {
  try {
    const res = await api.post('/students/verify-password', { roll_number, old_password });
    return res.data;
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.error || err?.response?.data?.message || 'Password verification failed';
    throw { status, message };
  }
};

// ----- Exam APIs -----
export const getExams = async () => {
  try {
    const res = await api.get("/exams");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch exams" };
  }
};

export const getAllExams = async () => {
  try {
    const res = await api.get("/exams");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch exams" };
  }
};

export const getLatestExamDetails = async () => {
  try {
    const res = await api.get('/exams/latest/details');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch latest exam details' };
  }
};

export const createExam = async (examData) => {
  try {
    const res = await api.post("/exams", examData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to create exam" };
  }
};

export const editExam = async (examId, examData) => {
  try {
    const res = await api.put(`/exams/${examId}`, examData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to edit exam" };
  }
};

export const deleteExam = async (examId) => {
  try {
    const res = await api.delete(`/exams/${examId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete exam" };
  }
};

export const getExamWithClasses = async (examId) => {
  try {
    const res = await api.get(`/exams/${examId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch exam details" };
  }
};

export const addExamClass = async (examId, classData) => {
  try {
    const res = await api.post(`/exams/${examId}/classes`, classData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to add exam class" };
  }
};

export const editExamClass = async (examId, classId, classData) => {
  try {
    const res = await api.put(`/exams/${examId}/classes/${classId}`, classData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to edit exam class" };
  }
};

export const deleteExamClass = async (examId, classId) => {
  try {
    const res = await api.delete(`/exams/${examId}/classes/${classId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete exam class" };
  }
};

// ----- PDF APIs -----
export const previewExamClassPDF = async (examId, classId, { templateType = 'compact_bengali', customization = {} } = {}) => {
  try {
    // Check if customization contains Bengali characters
    const hasBengaliChars = JSON.stringify(customization).match(/[\u0980-\u09FF]/);
    
    if (hasBengaliChars) {
      // Use POST request for Bengali characters to avoid URL encoding issues
      const res = await api.post(`/pdf/preview/${examId}/${classId}`, {
        templateType,
        customization
      }, {
        responseType: 'text'
      });
      return res.data; // HTML string
    } else {
      // Use GET request for ASCII characters
      const res = await api.get(`/pdf/preview/${examId}/${classId}`, {
        params: { templateType, ...customization },
        responseType: 'text'
      });
      return res.data; // HTML string
    }
  } catch (err) {
    throw err.response?.data || { message: 'Failed to preview PDF' };
  }
};

export const downloadExamClassPDF = async (examId, classId, { templateType = 'compact_bengali', customization = {} } = {}) => {
  try {
    // Backend generate endpoint returns PDF bytes
    const res = await api.post(`/pdf/generate/${examId}/${classId}`, {
      templateType,
      customization
    }, {
      responseType: 'blob'
    });
    return res.data; // Blob
  } catch (err) {
    throw err.response?.data || { message: 'Failed to download PDF' };
  }
};

// ----- Student APIs -----
export const getRegistrationCountOverTime = async () => {
  try {
    const res = await api.get("/students/registration-count-over-time");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch registration count over time" };
  }
};

// ----- Result APIs -----
export const getResults = async (examId) => {
  try {
    const res = await api.get(`/results/${examId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch results" };
  }
};

export const getFullResults = async () => {
  try {
    const res = await api.get("/results/full");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch all results" };
  }
};

export const getResultByStudentRoll = async (roll) => {
  try {
    const res = await api.get(`/results/roll/${roll}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch result by roll" };
  }
};

export const getResultByClass = async (className) => {
  try {
    const res = await api.get(`/results/class/${className}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch results by class" };
  }
};

export const getResultBySchool = async (school) => {
  try {
    const res = await api.post("/results/school", { school });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch results by school" };
  }
};

// ----- Manual Result Submit API -----
export const manualSubmitResult = async ({ roll_number, correct_count, wrong_count = 0 }) => {
  try {
    const res = await api.post("/results/manual-submit", { roll_number, correct_count, wrong_count });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to submit manual result" };
  }
};

// ----- Scholarship APIs -----
export const markForScholarship = async (studentId) => {
  try {
    const res = await api.post(`/results/mark-for-scholarship/${studentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to mark for scholarship" };
  }
};

export const unmarkForScholarship = async (studentId) => {
  try {
    const res = await api.post(`/results/unmark-for-scholarship/${studentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to unmark for scholarship" };
  }
};

export const getScholarshipResults = async () => {
  try {
    const res = await api.get("/results/scholarship-results");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch scholarship results" };
  }
};

// ----- Student Management APIs -----
export const getAllStudents = async () => {
  try {
    const res = await api.get("/students");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch all students" };
  }
};

export const getStudentByRoll = async (roll) => {
  try {
    const res = await api.get(`/students/roll/${roll}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch student by roll" };
  }
};

export const getStudentsByClass = async (className) => {
  try {
    const res = await api.get(`/students/class/${className}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students by class" };
  }
};

export const getStudentsBySchool = async (school) => {
  try {
    const res = await api.get(`/students/school/${school}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students by school" };
  }
};

export const getStudentsBySchoolAndClass = async (school, className) => {
  try {
    const res = await api.get(`/students/school/${school}/class/${className}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students by school and class" };
  }
};

// ----- SMS Reminder API -----
export const sendClassReminder = async (className, message) => {
  try {
    const res = await api.post(`/students/send-reminder`, { class: className, message });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to send reminder" };
  }
};

// Update Student API
export const updateStudent = async (studentId, updateData) => {
  try {
    const res = await api.put(`/students/${studentId}`, updateData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to update student" };
  }
};

// Delete Student API
export const deleteStudent = async (studentId) => {
  try {
    const res = await api.delete(`/students/${studentId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete student" };
  }
};

// ----- Admin Management APIs -----
export const getAllAdmins = async () => {
  try {
    const res = await api.get("/admin/admins");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch all admins" };
  }
};

export const createAdmin = async (adminData) => {
  try {
    const res = await api.post("/admin/register", adminData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to create admin" };
  }
};

export const updateAdmin = async (id, adminData) => {
  try {
    const res = await api.put(`/admin/admins/${id}`, adminData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to update admin" };
  }
};

export const deleteAdmin = async (id) => {
  try {
    const res = await api.delete(`/admin/admins/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete admin" };
  }
};

// ----- Finance APIs -----
export const getTotalIncome = async () => {
  try {
    const res = await api.get("/finance/total");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch total income" };
  }
};

export const getSchoolWiseIncome = async () => {
  try {
    const res = await api.get("/finance/school");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch school-wise income" };
  }
};

export const getClassWiseIncome = async () => {
  try {
    const res = await api.get("/finance/class");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch class-wise income" };
  }
};

export const getSchoolClassWiseIncome = async () => {
  try {
    const res = await api.get("/finance/school-class");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch school-class-wise income" };
  }
};

export const getCollectionByAdminId = async (adminId) => {
  try {
    const res = await api.get(`/finance/collection/${adminId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch collection by admin" };
  }
};

export const getAllAdminCollections = async () => {
  try {
    const res = await api.get("/finance/admin-collections");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch all admin collections" };
  }
};

// You can add more APIs as needed, for example:
// - assignExam
// - submitAnswers

export default api;

// ----- Admit Card APIs -----
export const downloadAdmitCardFlask = async (payload) => {
  try {
    // Use backend route that includes activity tracking
    const res = await api.post('/pdf/admit-card', payload, { responseType: 'blob' });
    return res.data; // Blob
  } catch (err) {
    const status = err?.response?.status;
    const message = err?.response?.data?.message || 'Failed to download admit card';
    throw { status, message };
  }
};

// ----- Analytics APIs -----
export const getLoginStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/analytics/login-stats?${queryString}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch login statistics' };
  }
};

export const getPDFStats = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/analytics/pdf-stats?${queryString}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch PDF statistics' };
  }
};

export const getDailySummary = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/analytics/daily-summary?${queryString}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch daily summary' };
  }
};

export const getActivityOverview = async () => {
  try {
    const res = await api.get('/analytics/overview');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch activity overview' };
  }
};

export const updateDailyAnalytics = async (date = null) => {
  try {
    const res = await api.post('/analytics/update-analytics', { date });
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to update daily analytics' };
  }
};

// ----- User Activity Tracking APIs -----
export const getTodayActivity = async () => {
  try {
    const res = await api.get('/analytics/activity/today');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch today\'s activity' };
  }
};

export const getWeekActivity = async () => {
  try {
    const res = await api.get('/analytics/activity/week');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch weekly activity' };
  }
};

export const getActiveUsers = async () => {
  try {
    const res = await api.get('/analytics/activity/active');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch active users' };
  }
};

export const getActivitySummary = async () => {
  try {
    const res = await api.get('/analytics/activity/summary');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch activity summary' };
  }
};

export const getAllActivity = async (page = 1, limit = 50) => {
  try {
    const res = await api.get(`/analytics/activity/all?page=${page}&limit=${limit}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch all activity' };
  }
};

export const getActivityStats = async () => {
  try {
    const res = await api.get('/analytics/activity/stats');
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: 'Failed to fetch activity statistics' };
  }
};
