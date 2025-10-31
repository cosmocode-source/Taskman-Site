import React from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import './Pages.css'

function Discussion() {
  const { projectId } = useParams()

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Discussion</h1>
            <p className="page-subtitle">Team discussions for Project #{projectId}</p>
          </div>

          <button className="add-task-btn" style={{ marginBottom: '1.5rem' }}>
            <span>+</span>
            New Discussion
          </button>

          <div className="empty-state">
            <div className="empty-icon">💬</div>
            <h3 className="empty-title">No discussions yet</h3>
            <p className="empty-description">
              Start a conversation with your team to collaborate and share ideas
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Discussion
