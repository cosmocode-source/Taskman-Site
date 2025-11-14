import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { tasksAPI, projectsAPI } from '../services/api'
import './Pages.css'

function KanbanBoard() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [draggedTask, setDraggedTask] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'proposed',
    priority: 'medium',
    dueDate: ''
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      const response = await projectsAPI.getById(projectId)
      setProject(response.data)
    } catch (err) {
      console.error('Error fetching project:', err)
    }
  }

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

  const columns = [
    { id: 'proposed', title: 'Proposed', color: '#6c757d' },
    { id: 'todo', title: 'To Do', color: '#0d6efd' },
    { id: 'in-progress', title: 'In Progress', color: '#ffc107' },
    { id: 'done', title: 'Done', color: '#28a745' }
  ]

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (e, task) => {
    setDraggedTask(task)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e, newStatus) => {
    e.preventDefault()
    
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null)
      return
    }

    try {
      const response = await tasksAPI.update(draggedTask._id, {
        ...draggedTask,
        status: newStatus
      })
      
      setTasks(tasks.map(t => 
        t._id === draggedTask._id ? response.data : t
      ))
    } catch (err) {
      console.error('Error updating task status:', err)
      alert('Failed to update task status')
    } finally {
      setDraggedTask(null)
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
      if (editingTask) {
        const response = await tasksAPI.update(editingTask._id, formData)
        setTasks(tasks.map(t => t._id === editingTask._id ? response.data : t))
        setEditingTask(null)
      } else {
        const user = JSON.parse(localStorage.getItem('user'))
        const response = await tasksAPI.create({
          ...formData,
          projectId,
          assignedTo: user?._id
        })
        setTasks([response.data, ...tasks])
      }
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        status: 'proposed',
        priority: 'medium',
        dueDate: ''
      })
    } catch (err) {
      console.error('Error saving task:', err)
      alert(err.response?.data?.message || 'Failed to save task')
    } finally {
      setCreating(false)
    }
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return
    }

    try {
      await tasksAPI.delete(taskId)
      setTasks(tasks.filter(t => t._id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      alert(err.response?.data?.message || 'Failed to delete task')
    }
  }

  const handleModalClose = () => {
    setShowModal(false)
    setEditingTask(null)
    setFormData({
      title: '',
      description: '',
      status: 'proposed',
      priority: 'medium',
      dueDate: ''
    })
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#dc3545'
      case 'medium': return '#ffc107'
      case 'low': return '#17a2b8'
      default: return '#6c757d'
    }
  }

  const handleCompleteProject = async () => {
    if (!project) return
    const ok = window.confirm(
      'Are you sure you want to mark this project as completed? You can still view it in Completed Projects.'
    )
    if (!ok) return

    try {
      const res = await projectsAPI.complete(projectId)
      setProject(prev => ({ ...(prev || {}), ...res.data }))
      alert('Project marked as completed.')
    } catch (error) {
      console.error('Error completing project:', error.response || error)
      alert(error.response?.data?.message || 'Failed to mark project as completed.')
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <h1>Kanban Board</h1>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading board...
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
          <h1>Kanban Board</h1>
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
      <div className="kanban-page">
        {/* top header row */}
        <div className="kanban-top-bar">
          <div className="kanban-top-left">
            {/* your existing project title, breadcrumbs, tabs etc */}
            {project && (
              <div className="kanban-header">
                <div className="kanban-header-left">
                  <h1 className="project-name">{project.name}</h1>
                  <p className="project-description">{project.description || 'No description'}</p>
                  <div className="team-section">
                    <span className="team-label">Team Members</span>
                    <div className="team-avatars">
                      {project.owner && (
                        <div className="avatar-circle" title={`${project.owner.name} (Lead)`}>
                          <i className="fas fa-user-circle"></i>
                        </div>
                      )}
                      {project.members?.slice(0, 3).map((member, idx) => (
                        <div key={idx} className="avatar-circle" title={member.name}>
                          <i className="fas fa-user-circle"></i>
                        </div>
                      ))}
                      {project.members?.length > 3 && (
                        <div className="avatar-circle more">
                          +{project.members.length - 3}
                        </div>
                      )}
                    </div>
                    <span className="member-names">
                      {project.owner?.name} (Lead)
                      {project.members?.length > 0 && `, ${project.members[0]?.name}`}
                    </span>
                  </div>
                </div>
                <div className="kanban-header-right">
                  <button className="btn-add" onClick={() => setShowModal(true)}>
                    <i className="fas fa-plus"></i>
                    Add Task
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="kanban-top-right">
            {project?.status === 'completed' ? (
              <span className="project-completed-pill">
                <i className="fas fa-check-circle"></i>
                Completed
              </span>
            ) : (
              <button
                type="button"
                className="btn-finish-project"
                onClick={handleCompleteProject}
              >
                <i className="fas fa-flag-checkered"></i>
                Mark Project as Completed
              </button>
            )}
          </div>
        </div>

        {/* existing columns / board UI below stays exactly as-is */}
        <div className="kanban-board">
          {columns.map(column => (
            <div 
              key={column.id} 
              className="kanban-column"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="column-header" style={{ borderTopColor: column.color }}>
                <h3>{column.title}</h3>
                <span className="task-count">{getTasksByStatus(column.id).length}</span>
              </div>
              
              <div className="column-content">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task._id}
                    className="kanban-card"
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                  >
                    <div className="card-header">
                      <h4 className="card-title">{task.title}</h4>
                      <div className="card-actions">
                        <button 
                          className="card-action-btn"
                          onClick={() => handleEditTask(task)}
                          title="Edit"
                        >
                          <i className="fas fa-edit"></i>
                        </button>
                        <button 
                          className="card-action-btn delete"
                          onClick={() => handleDeleteTask(task._id)}
                          title="Delete"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                    
                    {task.description && (
                      <p className="card-description">{task.description}</p>
                    )}
                    
                    <div className="card-footer">
                      <div className="card-meta">
                        {task.assignedTo && (
                          <div className="card-assignee" title={task.assignedTo.name}>
                            <i className="fas fa-user"></i>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="card-date">
                            <i className="far fa-calendar"></i>
                            <span>
                              {new Date(task.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                        )}
                      </div>
                      <div 
                        className="card-priority"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                        title={`${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority`}
                      >
                        {task.priority.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  </div>
                ))}
                
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="empty-column">
                    <i className="fas fa-inbox"></i>
                    <p>No tasks</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Task Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleModalClose}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingTask ? 'Edit Task' : 'Create New Task'}</h2>
              <button className="modal-close" onClick={handleModalClose}>
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
                  <option value="proposed">Proposed</option>
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
                  onClick={handleModalClose}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      {editingTask ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <i className={editingTask ? "fas fa-save" : "fas fa-plus"}></i>
                      {editingTask ? 'Update Task' : 'Create Task'}
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

export default KanbanBoard
