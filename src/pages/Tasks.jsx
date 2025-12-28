import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { tasksAPI, projectsAPI, announcementsAPI } from '../services/api'
import './Pages.css'

function Tasks() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [newMemberIdentifier, setNewMemberIdentifier] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: ''
  })
  const [announcementData, setAnnouncementData] = useState({
    title: '',
    description: '',
    icon: 'fas fa-bullhorn',
    priority: 'medium'
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchTasks()
    fetchProject()

    // Set up polling for real-time updates every 10 seconds
    const pollInterval = setInterval(() => {
      fetchTasks()
    }, 10000)

    // Cleanup interval on unmount
    return () => {
      clearInterval(pollInterval)
    }
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

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('Please enter a task title')
      return
    }

    setCreating(true)
    try {
      if (editingTask) {
        // Update existing task
        const response = await tasksAPI.update(editingTask._id, formData)
        setTasks(tasks.map(t => t._id === editingTask._id ? response.data : t))
        setEditingTask(null)
      } else {
        // Create new task
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
        status: 'todo',
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
      status: 'todo',
      priority: 'medium',
      dueDate: ''
    })
  }

  const handleAddMember = async () => {
    if (!newMemberIdentifier.trim()) {
      alert('Please enter a username or email')
      return
    }

    const currentUser = JSON.parse(localStorage.getItem('user'))
    const identifier = newMemberIdentifier.trim().toLowerCase()
    
    // Check if trying to add self
    if (identifier === currentUser?.email?.toLowerCase() || 
        identifier === currentUser?.username?.toLowerCase()) {
      alert('You are already part of this project!')
      return
    }

    // Check if trying to add the owner
    if (project?.owner && 
        (identifier === project.owner.email?.toLowerCase() || 
         identifier === project.owner.username?.toLowerCase())) {
      alert('This user is the project owner and already has full access!')
      return
    }

    // Check if user is already a member
    const isAlreadyMember = project?.members?.some(member => 
      identifier === member.email?.toLowerCase() || 
      identifier === member.username?.toLowerCase()
    )

    if (isAlreadyMember) {
      alert('This user is already a member of the project!')
      return
    }

    try {
      const response = await projectsAPI.addMember(projectId, newMemberIdentifier)
      setProject(response.data)
      setNewMemberIdentifier('')
      alert('Member added successfully!')
    } catch (err) {
      console.error('Error adding member:', err)
      alert(err.response?.data?.message || 'Failed to add member')
    }
  }

  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the project?')) {
      return
    }

    try {
      const response = await projectsAPI.removeMember(projectId, userId)
      setProject(response.data)
      alert('Member removed successfully!')
    } catch (err) {
      console.error('Error removing member:', err)
      alert(err.response?.data?.message || 'Failed to remove member')
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    
    if (!announcementData.title.trim() || !announcementData.description.trim()) {
      alert('Please fill in all fields')
      return
    }

    setCreating(true)
    try {
      await announcementsAPI.create({
        ...announcementData,
        projectId
      })
      setShowAnnouncementModal(false)
      setAnnouncementData({
        title: '',
        description: '',
        icon: 'fas fa-bullhorn',
        priority: 'medium'
      })
      alert('Announcement created successfully!')
    } catch (err) {
      console.error('Error creating announcement:', err)
      alert(err.response?.data?.message || 'Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  const iconOptions = [
    { value: 'fas fa-bullhorn', label: 'Announcement' },
    { value: 'fas fa-tools', label: 'Maintenance' },
    { value: 'fas fa-users', label: 'Team Update' },
    { value: 'fas fa-rocket', label: 'New Feature' },
    { value: 'fas fa-info-circle', label: 'Information' },
    { value: 'fas fa-exclamation-triangle', label: 'Warning' },
    { value: 'fas fa-calendar', label: 'Event' },
    { value: 'fas fa-star', label: 'Important' }
  ]

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
      <div className="page-content tasks-page">
        {/* Project Info Header */}
        {project && (
          <div className="project-info-header">
            <div className="project-info-left">
              <h1 className="project-name">{project.name}</h1>
              <div className="project-meta">
                <div className="project-meta-item">
                  <span className="meta-label">Project Description</span>
                  <p className="meta-value">{project.description || 'No description'}</p>
                </div>
                <div className="project-meta-item">
                  <span className="meta-label">Team Members</span>
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
            </div>
            <div className="project-info-right">
              <div className="project-actions">
                <button className="btn-secondary" onClick={() => setShowAnnouncementModal(true)}>
                  <i className="fas fa-bullhorn"></i>
                  Announcement
                </button>
                <button className="btn-secondary" onClick={() => setShowMembersModal(true)}>
                  <i className="fas fa-users"></i>
                  Team
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Task Controls */}
        <div className="task-controls">
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i>
            Create New Task
          </button>
          
          <div className="task-controls-right">
            <div className="filter-group">
              <label>Assignee:</label>
              <select className="filter-select">
                <option>All</option>
              </select>
            </div>
            <div className="filter-group">
              <label>Priority:</label>
              <select className="filter-select">
                <option>All</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="tasks-table-container">
          <div className="tasks-table-header">
            <h2>Tasks List</h2>
            <div className="sort-info">Sort By: Due Date</div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="empty-state">
              <i className="fas fa-tasks"></i>
              <p>No tasks yet. Create your first task!</p>
            </div>
          ) : (
            <div className="tasks-table">
              <div className="table-header">
                <div className="th th-title">Title</div>
                <div className="th th-assignee">Assignee</div>
                <div className="th th-status">Status</div>
                <div className="th th-priority">Priority</div>
                <div className="th th-date">Due Date</div>
                <div className="th th-actions">Actions</div>
              </div>
              
              <div className="table-body">
                {filteredTasks.map(task => (
                  <div key={task._id} className="table-row">
                    <div className="td td-title">
                      <span className="task-title-text">{task.title}</span>
                      {task.description && (
                        <span className="task-subtitle">{task.description}</span>
                      )}
                    </div>
                    <div className="td td-assignee">
                      {task.assignedTo ? task.assignedTo.name : '-'}
                    </div>
                    <div className="td td-status">
                      <span 
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(task.status) }}
                      >
                        {task.status === 'in-progress' ? 'In Progress' : 
                         task.status === 'todo' ? 'To Do' : 'Done'}
                      </span>
                    </div>
                    <div className="td td-priority">
                      <span 
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(task.priority) }}
                      >
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                    <div className="td td-date">
                      {task.dueDate 
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })
                        : '-'
                      }
                    </div>
                    <div className="td td-actions">
                      <button 
                        className="action-btn edit-btn"
                        onClick={() => handleEditTask(task)}
                        title="Edit"
                      >
                        <i className="fas fa-edit"></i>
                        Edit
                      </button>
                      <button 
                        className="action-btn delete-btn"
                        onClick={() => handleDeleteTask(task._id)}
                        title="Delete"
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="view-all-tasks">
          <a href="#" className="view-all-link">View All My Tasks</a>
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

      {/* Team Members Modal */}
      {showMembersModal && (
        <div className="modal-overlay" onClick={() => setShowMembersModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Team Members</h2>
              <button className="modal-close" onClick={() => setShowMembersModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="members-section">
              {/* Owner */}
              {project?.owner && (
                <div className="member-item owner-item">
                  <div className="member-avatar">
                    <i className="fas fa-user-circle"></i>
                  </div>
                  <div className="member-info">
                    <div className="member-name">{project.owner.name}</div>
                    <div className="member-username">@{project.owner.username}</div>
                    <div className="member-role">Owner</div>
                  </div>
                </div>
              )}

              {/* Members */}
              {project?.members && project.members.length > 0 && (
                <div className="members-list">
                  {project.members.map((member) => (
                    <div key={member._id} className="member-item">
                      <div className="member-avatar">
                        <i className="fas fa-user-circle"></i>
                      </div>
                      <div className="member-info">
                        <div className="member-name">{member.name}</div>
                        <div className="member-username">@{member.username}</div>
                      </div>
                      <button 
                        className="btn-remove-member"
                        onClick={() => handleRemoveMember(member._id)}
                        title="Remove member"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Member Form */}
              <div className="add-member-section">
                <h3>Add Team Member</h3>
                <div className="add-member-form">
                  <input
                    type="text"
                    value={newMemberIdentifier}
                    onChange={(e) => setNewMemberIdentifier(e.target.value)}
                    placeholder="Enter username or email"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  />
                  <button className="btn-primary" onClick={handleAddMember}>
                    <i className="fas fa-plus"></i>
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Project Announcement</h2>
              <button className="modal-close" onClick={() => setShowAnnouncementModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label htmlFor="announcementTitle">Title *</label>
                <input
                  type="text"
                  id="announcementTitle"
                  value={announcementData.title}
                  onChange={(e) => setAnnouncementData({ ...announcementData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="announcementDescription">Description *</label>
                <textarea
                  id="announcementDescription"
                  value={announcementData.description}
                  onChange={(e) => setAnnouncementData({ ...announcementData, description: e.target.value })}
                  placeholder="Enter announcement description"
                  rows="4"
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="announcementIcon">Icon</label>
                <select
                  id="announcementIcon"
                  value={announcementData.icon}
                  onChange={(e) => setAnnouncementData({ ...announcementData, icon: e.target.value })}
                  disabled={creating}
                >
                  {iconOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="announcementPriority">Priority</label>
                <select
                  id="announcementPriority"
                  value={announcementData.priority}
                  onChange={(e) => setAnnouncementData({ ...announcementData, priority: e.target.value })}
                  disabled={creating}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={() => setShowAnnouncementModal(false)}
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
                      <i className="fas fa-bullhorn"></i>
                      Create Announcement
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
