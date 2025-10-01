import axios from "axios";

// Base URL of your backend API
const API_BASE_URL = "http://localhost:4000/api"; // Updated to match your backend PORT

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

export const getExamWithSets = async (examId) => {
  try {
    const res = await api.get(`/exams/${examId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch exam details" };
  }
};

export const addExamSet = async (examId, setData) => {
  try {
    const res = await api.post(`/exams/${examId}/sets`, setData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to add exam set" };
  }
};

export const editExamSet = async (examId, setId, setData) => {
  try {
    const res = await api.put(`/exams/${examId}/sets/${setId}`, setData);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to edit exam set" };
  }
};

export const deleteExamSet = async (examId, setId) => {
  try {
    const res = await api.delete(`/exams/${examId}/sets/${setId}`);
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to delete exam set" };
  }
};

// ----- PDF APIs -----
export const previewExamSetPDF = async (examId, setId, { templateType = 'compact_bengali', customization = {} } = {}) => {
  try {
    // Backend preview endpoint returns HTML (text)
    const res = await api.get(`/pdf/preview/${examId}/${setId}`, {
      params: { templateType, ...customization },
      responseType: 'text'
    });
    return res.data; // HTML string
  } catch (err) {
    throw err.response?.data || { message: 'Failed to preview PDF' };
  }
};

export const downloadExamSetPDF = async (examId, setId, { templateType = 'compact_bengali', customization = {} } = {}) => {
  try {
    // Backend generate endpoint returns PDF bytes
    const res = await api.post(`/pdf/generate/${examId}/${setId}`, {
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
