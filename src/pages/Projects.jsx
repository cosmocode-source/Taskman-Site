import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { projectsAPI } from '../services/api'
import './Pages.css'

function Projects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db'
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      const response = await projectsAPI.getAll()
      setProjects(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load projects')
      console.error('Error fetching projects:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    
    if (!formData.name.trim()) {
      alert('Please enter a project name')
      return
    }

    setCreating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await projectsAPI.create({
        ...formData,
        owner: user?._id
      })
      setProjects([response.data, ...projects])
      setShowModal(false)
      setFormData({ name: '', description: '', color: '#3498db' })
    } catch (err) {
      console.error('Error creating project:', err)
      alert(err.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  const handleDeleteProject = async (e, projectId, projectName) => {
    e.preventDefault() // Prevent navigation to project
    e.stopPropagation()
    
    if (!confirm(`Are you sure you want to delete "${projectName}"? This action cannot be undone.`)) {
      return
    }

    try {
      await projectsAPI.delete(projectId)
      setProjects(projects.filter(p => p._id !== projectId))
    } catch (err) {
      console.error('Error deleting project:', err)
      alert(err.response?.data?.message || 'Failed to delete project')
    }
  }

  const colorOptions = [
    '#3498db', '#e74c3c', '#2ecc71', '#f39c12', 
    '#9b59b6', '#1abc9c', '#34495e', '#e67e22'
  ]

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <h1>My Projects</h1>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading projects...
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
          <h1>My Projects</h1>
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
          <h1>My Projects</h1>
          <button className="btn-add" onClick={() => setShowModal(true)}>
            <i className="fas fa-plus"></i>
            New Project
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-folder-open"></i>
            <p>No projects yet. Create your first project!</p>
          </div>
        ) : (
          <div className="projects-grid">
            {projects.map(project => (
              <Link 
                key={project._id} 
                to={`/project/${project._id}/tasks`} 
                className="project-card"
                style={{ borderLeft: `4px solid ${project.color || '#3498db'}` }}
              >
                <div className="project-header">
                  <h3>{project.name}</h3>
                  <div className="project-actions">
                    {project.owner && (
                      <div 
                        className="project-owner-avatar"
                        title={`Owner: ${project.owner.name}`}
                      >
                        <i className="fas fa-user-circle"></i>
                      </div>
                    )}
                    <button 
                      className="project-delete-btn"
                      onClick={(e) => handleDeleteProject(e, project._id, project.name)}
                      title="Delete project"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
                <p>{project.description}</p>
                {project.members && project.members.length > 0 && (
                  <div className="project-members">
                    <i className="fas fa-users"></i>
                    <span>{project.members.length} member{project.members.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label htmlFor="projectName">Project Name *</label>
                <input
                  type="text"
                  id="projectName"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label htmlFor="projectDescription">Description</label>
                <textarea
                  id="projectDescription"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter project description"
                  rows="3"
                  disabled={creating}
                />
              </div>
              <div className="form-group">
                <label>Project Color</label>
                <div className="color-picker">
                  {colorOptions.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${formData.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setFormData({ ...formData, color })}
                      disabled={creating}
                    />
                  ))}
                </div>
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
                      Create Project
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

export default Projects
