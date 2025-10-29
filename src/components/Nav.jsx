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
            🔔
          </button>
          <button className="icon-btn profile" title="Profile">
            👤
          </button>
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