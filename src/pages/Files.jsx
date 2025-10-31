import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import './Pages.css'

function Files() {
  const { projectId } = useParams()
  const [view, setView] = useState('grid')

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Files</h1>
            <p className="page-subtitle">Project files for Project #{projectId}</p>
          </div>

          <div className="files-toolbar">
            <div className="files-view-toggle">
              <button 
                className={`view-toggle-btn ${view === 'grid' ? 'active' : ''}`}
                onClick={() => setView('grid')}
              >
                Grid View
              </button>
              <button 
                className={`view-toggle-btn ${view === 'list' ? 'active' : ''}`}
                onClick={() => setView('list')}
              >
                List View
              </button>
            </div>
            <button className="upload-btn">
              <span>⬆️</span>
              Upload Files
            </button>
          </div>

          <div className="empty-state">
            <div className="empty-icon">📁</div>
            <h3 className="empty-title">No files yet</h3>
            <p className="empty-description">
              Upload documents, images, and other files to share with your team
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Files
