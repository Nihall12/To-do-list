import { useState, useEffect } from 'react'
import './App.css'

const API_BASE = 'http://127.0.0.1:5000/api/tasks'
const STATS_API = 'http://127.0.0.1:5000/api/stats'

function App() {
  const [tasks, setTasks] = useState([])
  const [stats, setStats] = useState({ total: 0, completed: 0, completionRate: 0, priorities: {} })
  const [newTitle, setNewTitle] = useState('')
  const [newTopic, setNewTopic] = useState('General')
  const [newPriority, setNewPriority] = useState('Medium')
  const [newEstimate, setNewEstimate] = useState('30 mins')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [tasksRes, statsRes] = await Promise.all([
        fetch(API_BASE),
        fetch(STATS_API)
      ])
      const tasksData = await tasksRes.json()
      const statsData = await statsRes.json()
      setTasks(tasksData)
      setStats(statsData)
    } catch (err) {
      console.error('Failed to fetch data:', err)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTitle.trim()) return

    try {
      await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, topic: newTopic, priority: newPriority, estimate: newEstimate })
      })
      setNewTitle('')
      setNewEstimate('30 mins')
      fetchData()
    } catch (err) {
      console.error('Failed to add task:', err)
    }
  }

  const toggleComplete = async (id, currentStatus) => {
    try {
      await fetch(`${API_BASE}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !currentStatus })
      })
      fetchData()
    } catch (err) {
      console.error('Failed to update task:', err)
    }
  }

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_BASE}/${id}`, { method: 'DELETE' })
      fetchData()
    } catch (err) {
      console.error('Failed to delete task:', err)
    }
  }

  const renderTask = (task) => (
    <div key={task.id || task._id} className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div
        className={`checkbox ${task.completed ? 'completed' : ''}`}
        onClick={() => toggleComplete(task.id || task._id, task.completed)}
      ></div>
      <div className="task-content">
        <div className="task-title">{task.title}</div>
        <div className="task-meta">
          <span className="topic-tag">{task.topic || 'General'}</span>
          <span className={`priority-tag priority-${task.priority}`}>{task.priority}</span>
          <span className="meta-sep">•</span>
          <span className="estimate-text">{task.estimate}</span>
        </div>
      </div>
      <button className="delete-btn" onClick={() => deleteTask(task.id || task._id)}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" /></svg>
      </button>
    </div>
  )

  const highPriority = tasks.filter(t => t.priority === 'High')
  const mediumPriority = tasks.filter(t => t.priority === 'Medium')
  const lowPriority = tasks.filter(t => t.priority === 'Low')

  return (
    <div className="app-container">
      <header className="main-header">
        <div className="logo-section">
          <h1>Daily Flow</h1>
          <p className="subtitle">Master your day, one task at a time.</p>
        </div>
        
        <div className="stats-dashboard">
          <div className="stat-card">
            <span className="stat-value">{stats.completionRate}%</span>
            <span className="stat-label">Progress</span>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${stats.completionRate}%` }}></div>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-value">{stats.total - stats.completed}</span>
            <span className="stat-label">Remaining</span>
          </div>
        </div>
      </header>

      <div className="glass-card main-content">
        <form className="add-task-section" onSubmit={addTask}>
          <div className="input-group">
            <input
              type="text"
              placeholder="What needs to be done?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="title-input"
            />
          </div>
          <div className="controls-group">
            <select value={newTopic} onChange={(e) => setNewTopic(e.target.value)} className="topic-select">
              <option value="General">Gen</option>
              <option value="Work">Work</option>
              <option value="Personal">Personal</option>
              <option value="Study">Study</option>
              <option value="Health">Health</option>
            </select>
            <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)} className="priority-select">
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <input
              type="text"
              placeholder="Est. time"
              value={newEstimate}
              onChange={(e) => setNewEstimate(e.target.value)}
              className="estimate-input"
            />
            <button type="submit" className="add-button">
              <span>Add</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>
        </form>

        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <p>Your list is clear. Time to conquer the world!</p>
          </div>
        ) : (
          <div className="task-workspace">
            {highPriority.length > 0 && (
              <div className="priority-group high">
                <div className="priority-title">Critical Focus</div>
                <div className="task-list">{highPriority.map(renderTask)}</div>
              </div>
            )}
            {mediumPriority.length > 0 && (
              <div className="priority-group medium">
                <div className="priority-title">Active Progress</div>
                <div className="task-list">{mediumPriority.map(renderTask)}</div>
              </div>
            )}
            {lowPriority.length > 0 && (
              <div className="priority-group low">
                <div className="priority-title">Later Today</div>
                <div className="task-list">{lowPriority.map(renderTask)}</div>
              </div>
            )}
          </div>
        )}
      </div>
      
      <footer className="footer">
        <p>Stay focused. Stay productive.</p>
      </footer>
    </div>
  )
}

export default App
