require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(express.json()); // Allow JSON requests
app.use(cors()); // Allow frontend requests

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Create Mongoose models
const User = mongoose.model("User", new mongoose.Schema({
  name: String,
  email: String,
}));

const Task = mongoose.model("Task", new mongoose.Schema({
  title: String,
  completed: Boolean,
  userId: mongoose.Schema.Types.ObjectId,
}));

// Routes
app.get("/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.get("/tasks", async (req, res) => {
  const tasks = await Task.find();
  res.json(tasks);
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
