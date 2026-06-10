import axios from "axios";

// Service URLs are configurable at build time through Vite environment values.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

// PDF service base URL
const PDF_SERVICE_URL = import.meta.env.VITE_PDF_SERVICE_URL || "http://localhost:5000";

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

// ─── Auth ────────────────────────────────────────────────────────────────────

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

export const registerAdmin = async (data) => {
  try {
    const res = await api.post("/admin/register", data);
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

// ─── Admin management ────────────────────────────────────────────────────────

export const getAllAdmins = async () => {
  try {
    const res = await api.get("/admin/admins");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch admins" };
  }
};

export const createAdmin = async (data) => {
  try {
    const res = await api.post("/admin/register", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to create admin" };
  }
};

export const updateAdmin = async (id, data) => {
  try {
    const res = await api.put(`/admin/admins/${id}`, data);
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

export const getAdminNameByUsername = async (username) => {
  try {
    const res = await api.get(`/admin/name/${username}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch admin name" };
  }
};

// ─── Students ────────────────────────────────────────────────────────────────

export const getAllStudents = async () => {
  try {
    const res = await api.get("/students");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students" };
  }
};

export const getStudentByRoll = async (roll) => {
  try {
    const res = await api.get(`/students/roll/${roll}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch student" };
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
    const res = await api.get(`/students/school/${encodeURIComponent(school)}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students by school" };
  }
};

export const getStudentsBySchoolAndClass = async (school, className) => {
  try {
    const res = await api.get(`/students/school/${encodeURIComponent(school)}/class/${className}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students by school and class" };
  }
};

export const deleteStudent = async (id) => {
  try {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete student" };
  }
};

export const getRegistrationCountOverTime = async () => {
  try {
    const res = await api.get("/students/registration-count-over-time");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch registration count" };
  }
};

export const sendClassReminder = async (data) => {
  try {
    const res = await api.post("/students/send-reminder", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to send reminder" };
  }
};

export const changeStudentPassword = async (data) => {
  try {
    const res = await api.post("/students/change-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to change password" };
  }
};

export const verifyStudentPassword = async (data) => {
  try {
    const res = await api.post("/students/verify-password", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to verify password" };
  }
};

// ─── Exams ───────────────────────────────────────────────────────────────────

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

export const getExamWithClasses = async (examId) => {
  try {
    const res = await api.get(`/exams/${examId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch exam" };
  }
};

export const getLatestExamDetails = async () => {
  try {
    const res = await api.get("/exams/latest/details");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch latest exam" };
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
    throw err.response?.data || { message: "Failed to update exam" };
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
    throw err.response?.data || { message: "Failed to update exam class" };
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

// ─── Results ─────────────────────────────────────────────────────────────────

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
    throw err.response?.data || { message: "Failed to fetch full results" };
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

export const getResultBySchool = async (data) => {
  try {
    const res = await api.post("/results/school", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch results by school" };
  }
};

export const manualSubmitResult = async (data) => {
  try {
    const res = await api.post("/results/manual-submit", data);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to submit result" };
  }
};

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
    throw err.response?.data || { message: "Failed to unmark scholarship" };
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

// ─── Finance ─────────────────────────────────────────────────────────────────

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
    throw err.response?.data || { message: "Failed to fetch school+class income" };
  }
};

export const getAllAdminCollections = async () => {
  try {
    const res = await api.get("/finance/admin-collections");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch admin collections" };
  }
};

// ─── PDF generation (via Flask PDF service at port 5000) ─────────────────────

/** Download exam question paper as a PDF blob */
export const downloadExamClassPDF = async (examId, classId, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/pdf/generate/${examId}/${classId}`,
      options,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        responseType: "blob",
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to download PDF" };
  }
};

/** Preview exam question paper as HTML (opens in new tab) */
export const previewExamClassPDF = async (examId, classId, options = {}) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_BASE_URL}/pdf/preview/${examId}/${classId}`,
      options,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to preview PDF" };
  }
};

/** Download admit card PDF directly from Flask service */
export const downloadAdmitCardFlask = async (payload) => {
  try {
    const res = await axios.post(
      `${PDF_SERVICE_URL}/generate-admit-card`,
      payload,
      {
        headers: { "Content-Type": "application/json" },
        responseType: "arraybuffer",
      }
    );
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to download admit card" };
  }
};

export default api;
