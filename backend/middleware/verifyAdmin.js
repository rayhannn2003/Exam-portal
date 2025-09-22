// filepath: /home/rayhan/Documents/exam-portal/backend/middleware/verifyAdmin.js
const jwt = require("jsonwebtoken");

function verifyToken(req, res) {
  const auth = req.headers.authorization || "";
  if (!auth.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  try {
    const token = auth.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return decoded;
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
}

const verifyAdmin = (req, res, next) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;
  if (decoded.role !== "admin" && decoded.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

const verifySuperAdmin = (req, res, next) => {
  const decoded = verifyToken(req, res);
  if (!decoded) return;
  if (decoded.role !== "superadmin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
};

module.exports = { verifyAdmin, verifySuperAdmin };
