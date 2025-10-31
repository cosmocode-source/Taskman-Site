import React from 'react'
import { Link, useParams } from 'react-router-dom'
import './Nav.css'

function Nav() {
  const { projectId } = useParams()

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link to="/">
            <span className="logo">✓</span>
            TaskMan
          </Link>
        </div>

        {/* Search Bar */}
        <div className="nav-search">
          <input type="text" placeholder="Search..." />
        </div>

        {/* Right Side Icons */}
        <div className="nav-icons">
          <button className="icon-btn" title="Notifications">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
              <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
            </svg>
          </button>
          <Link to="/signin" className="icon-btn profile" title="Profile">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </Link>
        </div>
      </div>

      {/* Navigation Links - Only show if we're in a project */}
      {projectId && (
        <div className="nav-links-container">
          <ul className="nav-links">
            <li><Link to={`/project/${projectId}/tasks`}>Tasks</Link></li>
            <li><Link to={`/project/${projectId}/calendar`}>Calendar</Link></li>
            <li><Link to={`/project/${projectId}/discussion`}>Discussion</Link></li>
            <li><Link to={`/project/${projectId}/files`}>Files</Link></li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav