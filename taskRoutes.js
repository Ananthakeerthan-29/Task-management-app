const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();

const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// Protect every task endpoint.
router.use(authMiddleware);

// 1. Create a task.
router.post("/", async (req, res) => {
try {
const { title, description, status, priority, dueDate } = req.body;


if (typeof title !== "string" || !title.trim()) {
  return res.status(400).json({
    message: "Task title is required.",
  });
}

const task = await Task.create({
  user: req.userId,
  title: title.trim(),
  description,
  status,
  priority,
  dueDate: dueDate || null,
});

return res.status(201).json(task);


} catch (error) {
return res.status(400).json({
message: error.message,
});
}
});

// 2. Get only the logged-in user's tasks.
router.get("/", async (req, res) => {
try {
const tasks = await Task.find({
user: req.userId,
}).sort({ createdAt: -1 });


return res.json(tasks);


} catch (error) {
return res.status(500).json({
message: "Unable to retrieve tasks.",
});
}
});

// 3. Update only a task owned by the logged-in user.
router.put("/:id", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({
message: "Invalid task ID.",
});
}


const { title, description, status, priority, dueDate } = req.body;
const updates = {};

if (title !== undefined) {
  if (typeof title !== "string" || !title.trim()) {
    return res.status(400).json({
      message: "Task title cannot be empty.",
    });
  }

  updates.title = title.trim();
}

if (description !== undefined) {
  updates.description = description;
}

if (status !== undefined) {
  updates.status = status;
}

if (priority !== undefined) {
  updates.priority = priority;
}

if (dueDate !== undefined) {
  updates.dueDate = dueDate || null;
}

const task = await Task.findOneAndUpdate(
  {
    _id: req.params.id,
    user: req.userId,
  },
  updates,
  {
    new: true,
    runValidators: true,
  }
);

if (!task) {
  return res.status(404).json({
    message: "Task not found.",
  });
}

return res.json(task);


} catch (error) {
return res.status(400).json({
message: error.message,
});
}
});

// 4. Delete only a task owned by the logged-in user.
router.delete("/:id", async (req, res) => {
try {
if (!mongoose.isValidObjectId(req.params.id)) {
return res.status(400).json({
message: "Invalid task ID.",
});
}


const task = await Task.findOneAndDelete({
  _id: req.params.id,
  user: req.userId,
});

if (!task) {
  return res.status(404).json({
    message: "Task not found.",
  });
}

return res.json({
  message: "Task deleted successfully.",
});


} catch (error) {
return res.status(500).json({
message: "Unable to delete task.",
});
}
});

module.exports = router;
