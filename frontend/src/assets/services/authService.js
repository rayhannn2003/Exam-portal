import { loginUser } from "../services/api";

const handleLogin = async (credentials) => {
  try {
    const res = await loginUser(credentials);
    localStorage.setItem("token", res.token);
    localStorage.setItem("role", res.role);
    // redirect based on role
    if (res.role === "admin") {
      window.location.href = "/admin/dashboard";
    } else {
      window.location.href = "/student/dashboard";
    }
  } catch (err) {
    alert(err.message || "Login failed");
  }
};
export default handleLogin;