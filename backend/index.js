const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
require("dotenv").config();

const studentRoutes = require("./routes/student");
const adminRoutes = require("./routes/admin");
const resultRoutes = require("./routes/result");
const examRoutes = require("./routes/exam");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use("/api", (req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  next();
});
app.use("/api/students", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/exams", examRoutes);


//print all api hit points
app.use((req, res, next) => {
  console.log(`🔍 ${req.method} ${req.originalUrl}`);
  next();
});

// Start server

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
