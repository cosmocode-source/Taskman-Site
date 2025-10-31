import React from 'react'
import Nav from '../components/Nav'
import './Pages.css'

function Projects() {
  const handleCreateProject = () => {
    alert('Create project functionality will be implemented with backend')
  }

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">My Projects</h1>
            <p className="page-subtitle">Manage and track all your projects in one place</p>
          </div>

          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3 className="empty-title">No projects yet</h3>
            <p className="empty-description">
              Create your first project to start managing tasks and collaborating with your team
            </p>
            <button className="add-task-btn" style={{ marginTop: '1rem' }} onClick={handleCreateProject}>
              <span>+</span>
              Create New Project
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default Projects
