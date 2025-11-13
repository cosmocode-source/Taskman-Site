import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { tasksAPI } from '../services/api'
import './Pages.css'

function Tasks() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTasks()
  }, [projectId])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await tasksAPI.getByProject(projectId)
      setTasks(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load tasks')
      console.error('Error fetching tasks:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return
    }

    setCreating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await tasksAPI.create({
        ...formData,
        projectId,
        assignedTo: user?._id
      })
      setTasks([response.data, ...tasks])
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        dueDate: ''
      })
    } catch (err) {
      console.error('Error creating task:', err)
      alert(err.response?.data?.message || 'Failed to create task')
    } finally {
      setCreating(false)
    }
  }

  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true
    return task.status === filter
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return '#6c757d'
      case 'in-progress': return '#ffc107'
      case 'done': return '#28a745'
      default: return '#6c757d'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <h1>Tasks</h1>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading tasks...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <h1>Tasks</h1>
          <div className="error">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-header">
          <h1>Tasks</h1>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i>
            New Task
          </button>
        </div>

        <div className="task-filters">
          <button 
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All ({tasks.length})
          </button>
          <button 
            className={`filter-btn ${filter === 'todo' ? 'active' : ''}`}
            onClick={() => setFilter('todo')}
          >
            To Do ({tasks.filter(t => t.status === 'todo').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'in-progress' ? 'active' : ''}`}
            onClick={() => setFilter('in-progress')}
          >
            In Progress ({tasks.filter(t => t.status === 'in-progress').length})
          </button>
          <button 
            className={`filter-btn ${filter === 'done' ? 'active' : ''}`}
            onClick={() => setFilter('done')}
          >
            Done ({tasks.filter(t => t.status === 'done').length})
          </button>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-tasks"></i>
            <p>No tasks {filter !== 'all' ? `with status "${filter}"` : 'yet. Create your first task!'}</p>
          </div>
        ) : (
          <div className="tasks-list">
            {filteredTasks.map(task => (
              <div key={task._id} className="task-card">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <div className="task-badges">
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(task.status) }}
                    >
                      {task.status}
                    </span>
                    <span 
                      className="priority-badge"
                      style={{ backgroundColor: getPriorityColor(task.priority) }}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
                
                {task.description && (
                  <p className="task-description">{task.description}</p>
                )}

                <div className="task-footer">
                  {task.assignedTo && (
                    <div className="task-assignee">
                      <i className="fas fa-user-circle"></i>
                      <span>{task.assignedTo.name}</span>
                    </div>
                  )}
                  
                  {task.dueDate && (
                    <div className="task-due-date">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Task</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label htmlFor="taskTitle">Task Title *</label>
                <input
                  type="text"
                  id="taskTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter task title"
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="taskDescription">Description</label>
                <textarea
                  id="taskDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter task description"
                  rows="3"
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="taskStatus">Status</label>
                <select
                  id="taskStatus"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  disabled={creating}
                >
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="taskPriority">Priority</label>
                <select
                  id="taskPriority"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  disabled={creating}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="taskDueDate">Due Date</label>
                <input
                  type="date"
                  id="taskDueDate"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  disabled={creating}
                />
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Creating...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-plus"></i>
                      Create Task
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export default Tasks
