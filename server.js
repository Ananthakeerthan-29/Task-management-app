const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

console.log(
  "JWT_SECRET loaded:",
  Boolean(process.env.JWT_SECRET)
);

const app = express();

// Import routes
const taskRoutes = require("./routes/taskRoutes");
const authRoutes = require("./routes/AuthRoutes");

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Task Management API is running!");
});

// Connect to MongoDB and start the server
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully!");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

startServer();