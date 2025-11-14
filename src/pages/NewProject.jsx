import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { projectsAPI } from '../services/api'
import './Pages.css'

function NewProject() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3498db'
  })
  const [inviteEmail, setInviteEmail] = useState('')
  const [pendingInvites, setPendingInvites] = useState([])
  const [creating, setCreating] = useState(false)

  const handleAddInvite = () => {
    const trimmedInput = inviteEmail.trim()
    if (trimmedInput) {
      // Accept both username and email formats
      const isEmail = trimmedInput.includes('@')
      if (isEmail && !trimmedInput.includes('@')) {
        alert('Please enter a valid email or username')
        return
      }
      setPendingInvites([...pendingInvites, trimmedInput])
      setInviteEmail('')
    } else {
      alert('Please enter a username or email address')
    }
  }

  const handleRemoveInvite = (emailToRemove) => {
    setPendingInvites(pendingInvites.filter(email => email !== emailToRemove))
  }

  const handleActivateProject = async () => {
    if (!formData.name.trim()) {
      alert('Please enter a project title')
      return
    }

    setCreating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user'))
      const response = await projectsAPI.create({
        ...formData,
        owner: user?._id,
        invitedEmails: pendingInvites
      })
      
      // Navigate to the newly created project
      navigate(`/project/${response.data._id}/tasks`)
    } catch (err) {
      console.error('Error creating project:', err)
      alert(err.response?.data?.message || 'Failed to create project')
      setCreating(false)
    }
  }

  const getStatusDots = (index) => {
    // Simulated status dots for visual representation
    const dots = ['●', '●', '●', '●', '○']
    return dots.slice(0, 4 + index)
  }

  return (
    <>
      <Nav />
      <div className="new-project-container">
        {/* Left Side - Form */}
        <div className="new-project-left">
          <div className="new-project-header">
            <Link to="/dashboard" className="back-button">
              <i className="fas fa-arrow-left"></i> Back to Dashboard
            </Link>
            <div className="new-project-badge">New Project</div>
          </div>

          <h1 className="new-project-title">Create a New Project</h1>

          <div className="new-project-form">
            <div className="form-section">
              <label htmlFor="projectTitle">Project Title *</label>
              <input
                type="text"
                id="projectTitle"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                disabled={creating}
              />
            </div>

            <div className="form-section">
              <label htmlFor="projectDescription">Project Description (max 500 characters)</label>
              <textarea
                id="projectDescription"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Briefly describe your project goals and objectives"
                rows="4"
                maxLength={500}
                disabled={creating}
              />
              <div className="char-count">
                {formData.description.length}/500 characters
              </div>
            </div>

            <div className="form-section">
              <label>Team Size</label>
              <div className="team-size-info">
                <div className="size-metric">
                  <span className="size-number">{pendingInvites.length + 1}</span>
                  <span className="size-label">Total Members</span>
                </div>
                <div className="size-breakdown">
                  <span>You + {pendingInvites.length} invited</span>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Add Team Members</h3>
              <div className="invite-section">
                <div className="invite-input-group">
                  <div className="search-input">
                    <i className="fas fa-search"></i>
                    <input
                      type="text"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="Enter username or email address"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddInvite())}
                      disabled={creating}
                    />
                  </div>
                  <button 
                    type="button" 
                    className="btn-send-invite"
                    onClick={handleAddInvite}
                    disabled={creating}
                  >
                    <i className="fas fa-plus"></i>
                    Add Member
                  </button>
                </div>

                {pendingInvites.length > 0 && (
                  <div className="pending-invites-list">
                    <div className="invites-header">
                      <span className="invites-count">{pendingInvites.length} member{pendingInvites.length !== 1 ? 's' : ''} invited</span>
                    </div>
                    {pendingInvites.map((identifier, index) => (
                      <div key={index} className="pending-invite-item">
                        <div className="invite-info">
                          <div className="invite-icon">
                            <i className="fas fa-user-circle"></i>
                          </div>
                          <div className="invite-details">
                            <span className="invite-identifier">
                              {identifier.includes('@') ? identifier : `@${identifier}`}
                            </span>
                            <span className="invite-status">Pending</span>
                          </div>
                        </div>
                        <button 
                          className="remove-invite-btn"
                          onClick={() => handleRemoveInvite(identifier)}
                          disabled={creating}
                          title="Remove invitation"
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button 
              className="btn-activate-project"
              onClick={handleActivateProject}
              disabled={creating || !formData.name.trim()}
            >
              {creating ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> Creating Project...
                </>
              ) : (
                <>
                  <i className="fas fa-rocket"></i>
                  Create Project
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Side - Team Summary */}
        <div className="new-project-right">
          <div className="project-preview-section">
            <div className="invite-team-section">
              <h3>Team Members Summary</h3>
              {pendingInvites.length > 0 ? (
                <div className="invite-preview-list">
                  <div className="preview-list-header">
                    <span>Pending Invitations ({pendingInvites.length})</span>
                  </div>
                  {pendingInvites.map((identifier, index) => (
                    <div key={index} className="invite-preview-item">
                      <i className="fas fa-user-plus"></i>
                      <span>
                        {identifier.includes('@') ? identifier : `@${identifier}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-invites-preview">
                  <i className="fas fa-user-friends"></i>
                  <p>No team members invited yet. You can add them later!</p>
                </div>
              )}
              
              <div className="preview-actions">
                <button 
                  className="btn-cancel"
                  onClick={() => navigate('/dashboard')}
                  disabled={creating}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="btn-clear-draft"
                  onClick={() => {
                    if (confirm('Clear all form data?')) {
                      setFormData({ name: '', description: '', color: '#3498db' })
                      setPendingInvites([])
                    }
                  }}
                  disabled={creating || (!formData.name && !formData.description && pendingInvites.length === 0)}
                >
                  <i className="fas fa-eraser"></i>
                  Clear List
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NewProject
