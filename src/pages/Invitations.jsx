import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { invitationsAPI } from '../services/api'
import './Pages.css'

function Invitations() {
  const navigate = useNavigate()
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(null)

  useEffect(() => {
    fetchInvitations()
  }, [])

  const fetchInvitations = async () => {
    try {
      setLoading(true)
      const user = JSON.parse(localStorage.getItem('user'))
      if (!user || !user.email) {
        setError('User not found')
        return
      }

      const response = await invitationsAPI.getByUserEmail(user.email)
      setInvitations(response.data)
      setError(null)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load invitations')
      console.error('Error fetching invitations:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAccept = async (invitationId) => {
    setProcessing(invitationId)
    try {
      await invitationsAPI.accept(invitationId)
      
      // Remove from list
      setInvitations(invitations.filter(inv => inv._id !== invitationId))
      
      // Show success message
      alert('Invitation accepted! You can now access the project.')
    } catch (err) {
      console.error('Error accepting invitation:', err)
      alert(err.response?.data?.message || 'Failed to accept invitation')
    } finally {
      setProcessing(null)
    }
  }

  const handleReject = async (invitationId) => {
    if (!confirm('Are you sure you want to decline this invitation?')) {
      return
    }

    setProcessing(invitationId)
    try {
      await invitationsAPI.reject(invitationId)
      
      // Remove from list
      setInvitations(invitations.filter(inv => inv._id !== invitationId))
      
      alert('Invitation declined')
    } catch (err) {
      console.error('Error rejecting invitation:', err)
      alert(err.response?.data?.message || 'Failed to decline invitation')
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-container">
          <div className="loading-state">
            <i className="fas fa-spinner fa-spin"></i> Loading invitations...
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page-container">
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">
              <i className="fas fa-envelope-open"></i>
              Project Invitations
            </h1>
            <p className="page-subtitle">
              Review and respond to project invitations
            </p>
          </div>
          <Link to="/dashboard" className="btn-secondary">
            <i className="fas fa-arrow-left"></i>
            Back to Dashboard
          </Link>
        </div>

        {error && (
          <div className="error-state">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        )}

        {!error && invitations.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="far fa-envelope"></i>
            </div>
            <h2>No Pending Invitations</h2>
            <p>You don't have any project invitations at the moment.</p>
            <Link to="/dashboard" className="btn-primary">
              <i className="fas fa-home"></i>
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="invitations-grid">
            {invitations.map(invitation => (
              <div key={invitation._id} className="invitation-card">
                <div className="invitation-header">
                  <div 
                    className="invitation-color-bar" 
                    style={{ backgroundColor: invitation.project?.color || '#3498db' }}
                  ></div>
                  <div className="invitation-badge">
                    <i className="fas fa-envelope"></i>
                    Invitation
                  </div>
                </div>
                
                <div className="invitation-body">
                  <h3 className="invitation-project-name">
                    {invitation.project?.name || 'Project'}
                  </h3>
                  
                  {invitation.project?.description && (
                    <p className="invitation-project-desc">
                      {invitation.project.description}
                    </p>
                  )}
                  
                  <div className="invitation-meta">
                    <div className="invitation-from">
                      <i className="fas fa-user"></i>
                      <span>
                        Invited by <strong>{invitation.invitedBy?.name || 'Unknown'}</strong>
                      </span>
                    </div>
                    <div className="invitation-date">
                      <i className="far fa-clock"></i>
                      <span>
                        {new Date(invitation.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="invitation-actions">
                  <button
                    className="btn-decline"
                    onClick={() => handleReject(invitation._id)}
                    disabled={processing === invitation._id}
                  >
                    {processing === invitation._id ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-times"></i>
                        Decline
                      </>
                    )}
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() => handleAccept(invitation._id)}
                    disabled={processing === invitation._id}
                  >
                    {processing === invitation._id ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Processing...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check"></i>
                        Accept
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default Invitations
