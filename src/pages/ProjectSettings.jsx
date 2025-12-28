import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { projectsAPI } from '../services/api'
import './Pages.css'

function ProjectSettings() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [project, setProject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db'
  })
  const [showCompleteModal, setShowCompleteModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  useEffect(() => {
    fetchProject()
  }, [projectId])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getById(projectId)
      setProject(response.data)
      setFormData({
        name: response.data.name,
        description: response.data.description || '',
        color: response.data.color || '#3498db'
      })
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load project')
      console.error('Error fetching project:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Project name is required')
      return
    }

    setSaving(true)
    try {
      const response = await projectsAPI.update(projectId, formData)
      setProject(response.data)
      alert('Project settings updated successfully')
    } catch (err) {
      console.error('Error updating project:', err)
      alert(err.response?.data?.message || 'Failed to update project')
    } finally {
      setSaving(false)
    }
  }

  const handleMarkComplete = async () => {
    try {
      await projectsAPI.complete(projectId)
      navigate('/projects')
    } catch (error) {
      console.error('Error marking project as completed:', error)
      alert(error.response?.data?.message || 'Failed to mark project as completed.')
    }
  }

  const handleDeleteProject = async () => {
    try {
      await projectsAPI.delete(projectId)
      navigate('/projects')
    } catch (err) {
      console.error('Error deleting project:', err)
      alert(err.response?.data?.message || 'Failed to delete project')
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading settings...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="page-container">
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page-container">
        <div className="settings-header">
          <div className="settings-header-content">
            <div className="settings-header-left">
              <div className="settings-header-icon">
                <i className="fas fa-cog"></i>
              </div>
              <div className="settings-header-text">
                <h1>Project Settings</h1>
                <p>Manage {project?.name} settings</p>
              </div>
            </div>
            <button 
              className="btn-secondary"
              onClick={() => navigate(`/project/${projectId}/tasks`)}
            >
              <i className="fas fa-arrow-left"></i>
              Back to Project
            </button>
          </div>
        </div>

        <div className="settings-container">
          {/* General Settings */}
          <div className="settings-section">
            <div className="settings-section-header">
              <h2>General Settings</h2>
              <p>Update project name, description, and appearance</p>
            </div>

            <form onSubmit={handleSave} className="settings-form">
              <div className="form-group">
                <label htmlFor="name">Project Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter project name"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter project description"
                  rows="4"
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label htmlFor="color">Project Color</label>
                <div className="color-picker-group">
                  <input
                    type="color"
                    id="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    disabled={saving}
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={handleChange}
                    name="color"
                    placeholder="#3498db"
                    disabled={saving}
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Saving...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    Save Changes
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Project Status */}
          {project?.status !== 'completed' && (
            <div className="settings-section">
              <div className="settings-section-header">
                <h2>Project Status</h2>
                <p>Mark this project as completed when all work is done</p>
              </div>

              <div className="settings-action">
                <div className="action-info">
                  <i className="fas fa-flag-checkered action-icon success"></i>
                  <div>
                    <h3>Mark as Completed</h3>
                    <p>Move this project to completed projects. You can still view and access it later.</p>
                  </div>
                </div>
                <button 
                  className="btn-action success"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <i className="fas fa-check-circle"></i>
                  Complete Project
                </button>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="settings-section danger-zone">
            <div className="settings-section-header">
              <h2>Danger Zone</h2>
              <p>Irreversible actions - proceed with caution</p>
            </div>

            <div className="settings-action">
              <div className="action-info">
                <i className="fas fa-trash-alt action-icon danger"></i>
                <div>
                  <h3>Delete Project</h3>
                  <p>Permanently delete this project and all its data. This action cannot be undone.</p>
                </div>
              </div>
              <button 
                className="btn-action danger"
                onClick={() => setShowDeleteModal(true)}
              >
                <i className="fas fa-trash"></i>
                Delete Project
              </button>
            </div>
          </div>
        </div>

        {/* Complete Project Modal */}
        {showCompleteModal && (
          <div className="modal-overlay" onClick={() => setShowCompleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Mark Project as Completed</h2>
                <button className="modal-close" onClick={() => setShowCompleteModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to mark <strong>{project?.name}</strong> as completed?</p>
                <p>You can still view and access it in Completed Projects.</p>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowCompleteModal(false)}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={() => {
                  handleMarkComplete()
                  setShowCompleteModal(false)
                }}>
                  <i className="fas fa-check-circle"></i>
                  Mark as Complete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Project Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Delete Project</h2>
                <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', padding: '16px', background: 'rgba(231, 76, 60, 0.1)', borderRadius: '8px', border: '1px solid rgba(231, 76, 60, 0.3)' }}>
                  <i className="fas fa-exclamation-triangle" style={{ fontSize: '24px', color: '#e74c3c' }}></i>
                  <div>
                    <strong style={{ color: '#e74c3c' }}>Warning: This action cannot be undone</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>All data will be permanently deleted</p>
                  </div>
                </div>
                <p>Are you sure you want to delete <strong>{project?.name}</strong>?</p>
                <p>This will permanently delete:</p>
                <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
                  <li>All tasks and subtasks</li>
                  <li>All files and attachments</li>
                  <li>All discussions and comments</li>
                  <li>All project settings and data</li>
                </ul>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="btn-danger" onClick={() => {
                  handleDeleteProject()
                  setShowDeleteModal(false)
                }}>
                  <i className="fas fa-trash"></i>
                  Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

export default ProjectSettings
