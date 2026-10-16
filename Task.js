const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
{
user: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: true,
index: true,
},


title: {
  type: String,
  required: true,
  trim: true,
},

description: {
  type: String,
  default: "",
},

status: {
  type: String,
  enum: ["Pending", "In Progress", "Completed"],
  default: "Pending",
},

priority: {
  type: String,
  enum: ["Low", "Medium", "High"],
  default: "Medium",
},

dueDate: {
  type: Date,
  default: null,
},


},
{
timestamps: true,
}
);

module.exports = mongoose.model("Task", taskSchema);
