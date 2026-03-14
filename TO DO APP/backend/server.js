const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Task Storage Logic (Hybrid MongoDB / Local JSON)
let useMongo = false;
let tasks = [];
const DB_FILE = path.join(__dirname, 'database.json');

// Initialize Local Data
if (fs.existsSync(DB_FILE)) {
    tasks = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
}

const MONGO_URI = 'mongodb://127.0.0.1:27017/todoapp';
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
      console.log('Connected to MongoDB');
      useMongo = true;
  })
  .catch(err => {
      console.log('MongoDB not found, using local database.json');
      useMongo = false;
  });

// Task Schema (Mongoose)
const taskSchema = new mongoose.Schema({
  title: String,
  topic: { type: String, default: 'General' },
  priority: { type: String, default: 'Medium' },
  estimate: { type: String, default: '30 mins' },
  completed: { type: Boolean, default: false }
});
const Task = mongoose.model('Task', taskSchema);

// Helper to save local tasks
const saveLocal = () => fs.writeFileSync(DB_FILE, JSON.stringify(tasks, null, 2));

// API Routes
app.get('/api/tasks', async (req, res) => {
  if (useMongo) return res.json(await Task.find());
  res.json(tasks);
});

app.post('/api/tasks', async (req, res) => {
  const taskData = req.body;
  if (useMongo) {
      const newTask = new Task(taskData);
      await newTask.save();
      return res.json(newTask);
  }
  const newTask = { _id: Date.now().toString(), ...taskData, completed: false };
  tasks.push(newTask);
  saveLocal();
  res.json(newTask);
});

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  if (useMongo) return res.json(await Task.findByIdAndUpdate(id, req.body, { new: true }));
  
  const index = tasks.findIndex(t => t._id === id);
  if (index > -1) {
      tasks[index] = { ...tasks[index], ...req.body };
      saveLocal();
      res.json(tasks[index]);
  } else {
      res.status(404).send();
  }
});

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  if (useMongo) {
      await Task.findByIdAndDelete(id);
      return res.status(204).send();
  }
  tasks = tasks.filter(t => t._id !== id);
  saveLocal();
  res.status(204).send();
});

app.get('/api/stats', async (req, res) => {
    const currentTasks = useMongo ? await Task.find() : tasks;
    const total = currentTasks.length;
    const completed = currentTasks.filter(t => t.completed).length;
    const priorities = {"High": 0, "Medium": 0, "Low": 0};
    currentTasks.forEach(t => priorities[t.priority] = (priorities[t.priority] || 0) + 1);
    
    res.json({
        total,
        completed,
        completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
        priorities
    });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
