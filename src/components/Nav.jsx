import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import './Nav.css'

function Nav() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/signin')
  }

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Logo */}
        <div className="nav-brand">
          <Link to={user ? "/projects" : "/"}>
            <span className="logo">✓</span>
            TaskMan
          </Link>
        </div>

        {/* Search Bar - only show when logged in */}
        {user && (
          <div className="nav-search">
            <i className="fas fa-search"></i>
            <input type="text" placeholder="Search..." />
          </div>
        )}

        {/* Right Side */}
        <div className="nav-icons">
          {user ? (
            <>
              <button className="icon-btn" title="Notifications">
                <i className="far fa-bell"></i>
              </button>
              <div className="user-menu">
                <button 
                  className="icon-btn profile" 
                  onClick={() => setShowDropdown(!showDropdown)}
                  title={user.name}
                >
                  <i className="fas fa-user-circle"></i>
                </button>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <div className="dropdown-header">
                      <div className="dropdown-user-name">{user.name}</div>
                      <div className="dropdown-user-email">{user.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/projects" className="dropdown-item">
                      <i className="fas fa-folder"></i>
                      My Projects
                    </Link>
                    <button onClick={handleLogout} className="dropdown-item logout">
                      <i className="fas fa-sign-out-alt"></i>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/signin" className="btn-signin">
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Navigation Links - Only show if we're in a project */}
      {projectId && user && (
        <div className="nav-links-container">
          <ul className="nav-links">
            <li><Link to={`/project/${projectId}/tasks`}><i className="fas fa-tasks"></i> Tasks</Link></li>
            <li><Link to={`/project/${projectId}/calendar`}><i className="far fa-calendar"></i> Calendar</Link></li>
            <li><Link to={`/project/${projectId}/discussion`}><i className="far fa-comments"></i> Discussion</Link></li>
            <li><Link to={`/project/${projectId}/files`}><i className="far fa-folder"></i> Files</Link></li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav