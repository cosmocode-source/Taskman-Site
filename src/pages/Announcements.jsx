import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { announcementsAPI, projectsAPI } from '../services/api'
import './Pages.css'

function Announcements() {
  const [announcements, setAnnouncements] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    projectId: '',
    icon: 'fas fa-bullhorn',
    priority: 'medium'
  })
  const [creating, setCreating] = useState(false)

  const iconOptions = [
    { value: 'fas fa-bullhorn', label: 'Announcement' },
    { value: 'fas fa-tools', label: 'Maintenance' },
    { value: 'fas fa-users', label: 'Community' },
    { value: 'fas fa-rocket', label: 'New Feature' },
    { value: 'fas fa-info-circle', label: 'Information' },
    { value: 'fas fa-exclamation-triangle', label: 'Warning' },
    { value: 'fas fa-gift', label: 'Special Offer' },
    { value: 'fas fa-calendar', label: 'Event' }
  ]

  useEffect(() => {
    fetchAnnouncements()
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      const response = await projectsAPI.getAll()
      setProjects(response.data)
    } catch (error) {
      console.error('Error fetching projects:', error)
    }
  }

  const fetchAnnouncements = async () => {
    try {
      setLoading(true)
      const response = await announcementsAPI.getAll()
      setAnnouncements(response.data)
    } catch (error) {
      console.error('Error fetching announcements:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAnnouncement = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.description.trim() || !formData.projectId) {
      alert('Please fill in all required fields including project')
      return
    }

    setCreating(true)
    try {
      const response = await announcementsAPI.create(formData)
      setAnnouncements([response.data, ...announcements])
      setShowModal(false)
      setFormData({
        title: '',
        description: '',
        projectId: '',
        icon: 'fas fa-bullhorn',
        priority: 'medium'
      })
    } catch (error) {
      console.error('Error creating announcement:', error)
      alert(error.response?.data?.message || 'Failed to create announcement')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteAnnouncement = async (id) => {
    if (!confirm('Are you sure you want to delete this announcement?')) {
      return
    }

    try {
      await announcementsAPI.delete(id)
      setAnnouncements(announcements.filter(a => a._id !== id))
    } catch (error) {
      console.error('Error deleting announcement:', error)
      alert(error.response?.data?.message || 'Failed to delete announcement')
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading announcements...
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
          <h1>Announcements</h1>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i>
            New Announcement
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-bullhorn"></i>
            <p>No announcements yet. Create your first announcement!</p>
          </div>
        ) : (
          <div className="announcements-grid">
            {announcements.map(announcement => (
              <div 
                key={announcement._id} 
                className={`announcement-card priority-${announcement.priority}`}
              >
                <div className="announcement-card-header">
                  <div className="announcement-icon-title">
                    <i className={announcement.icon}></i>
                    <h3>{announcement.title}</h3>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteAnnouncement(announcement._id)}
                    title="Delete announcement"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                </div>
                <p className="announcement-card-description">
                  {announcement.description}
                </p>
                {announcement.project && (
                  <div className="announcement-project-badge" style={{ borderLeftColor: announcement.project.color }}>
                    <i className="fas fa-folder"></i> {announcement.project.name}
                  </div>
                )}
                <div className="announcement-card-footer">
                  <span className={`priority-badge ${announcement.priority}`}>
                    {announcement.priority}
                  </span>
                  <span className="announcement-date">
                    {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Announcement Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Announcement</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateAnnouncement}>
              <div className="form-group">
                <label htmlFor="announcementProject">Project *</label>
                <select
                  id="announcementProject"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                  required
                  disabled={creating}
                >
                  <option value="">Select a project</option>
                  {projects.map(project => (
                    <option key={project._id} value={project._id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="announcementTitle">Title *</label>
                <input
                  type="text"
                  id="announcementTitle"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter announcement title"
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="announcementDescription">Description *</label>
                <textarea
                  id="announcementDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
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
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
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

export default Announcements
