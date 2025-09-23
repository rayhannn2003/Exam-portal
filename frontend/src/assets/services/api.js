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

// ----- Student APIs -----
export const getAllStudents = async () => {
  try {
    const res = await api.get("/students");
    return res.data;
  } catch (err) {
    throw err.response?.data || { message: "Failed to fetch students" };
  }
};

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

// You can add more APIs as needed, for example:
// - assignExam
// - submitAnswers

export default api;
