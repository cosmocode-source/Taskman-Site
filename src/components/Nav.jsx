import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { announcementsAPI } from '../services/api'
import './Nav.css'

function Nav() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [announcements, setAnnouncements] = useState([])
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false)
  const notificationRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      fetchAnnouncements()
    }
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false)
      }
    }

    if (showNotifications || showDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [showNotifications, showDropdown])

  const fetchAnnouncements = async () => {
    try {
      const response = await announcementsAPI.getAll()
      setAnnouncements(response.data.slice(0, 5)) // Show latest 5
      
      // Check if user has viewed notifications
      const lastViewedTime = localStorage.getItem('lastViewedNotifications')
      if (response.data.length > 0 && lastViewedTime) {
        const hasNewNotifications = response.data.some(announcement => 
          new Date(announcement.createdAt) > new Date(lastViewedTime)
        )
        setHasUnreadNotifications(hasNewNotifications)
      } else if (response.data.length > 0) {
        setHasUnreadNotifications(true)
      }
    } catch (error) {
      console.error('Error fetching announcements:', error)
    }
  }

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications) {
      // Mark notifications as read
      localStorage.setItem('lastViewedNotifications', new Date().toISOString())
      setHasUnreadNotifications(false)
    }
  }

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
          <Link to={user ? "/dashboard" : "/"}>
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
              <div className="notification-wrapper" ref={notificationRef}>
                <button 
                  className="icon-btn" 
                  onClick={handleNotificationClick}
                  title="Notifications"
                >
                  <i className="far fa-bell"></i>
                  {hasUnreadNotifications && announcements.length > 0 && (
                    <span className="notification-badge">{announcements.length}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Recent Announcements</h3>
                      <button 
                        className="close-notifications"
                        onClick={() => setShowNotifications(false)}
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                    <div className="notifications-list">
                      {announcements.length > 0 ? (
                        <>
                          {announcements.map(announcement => (
                            <div key={announcement._id} className="notification-item">
                              <i className={announcement.icon}></i>
                              <div className="notification-content">
                                <div className="notification-title">{announcement.title}</div>
                                <div className="notification-desc">{announcement.description}</div>
                                {announcement.project && (
                                  <div className="notification-project" style={{ color: announcement.project.color }}>
                                    <i className="fas fa-folder"></i> {announcement.project.name}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                          <Link 
                            to="/announcements" 
                            className="view-all-notifications"
                            onClick={() => setShowNotifications(false)}
                          >
                            View All Announcements
                          </Link>
                        </>
                      ) : (
                        <div className="no-notifications">
                          <i className="far fa-bell-slash"></i>
                          <p>No announcements</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="user-menu" ref={dropdownRef}>
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
                      <div className="dropdown-user-username">@{user.username}</div>
                      <div className="dropdown-user-email">{user.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to="/dashboard" className="dropdown-item">
                      <i className="fas fa-home"></i>
                      Dashboard
                    </Link>
                    <Link to="/projects" className="dropdown-item">
                      <i className="fas fa-folder"></i>
                      My Projects
                    </Link>
                    <Link to="/invitations" className="dropdown-item">
                      <i className="fas fa-envelope-open"></i>
                      Invitations
                    </Link>
                    <Link to="/announcements" className="dropdown-item">
                      <i className="fas fa-bullhorn"></i>
                      Announcements
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
            <li><Link to={`/project/${projectId}/kanban`} className={location.pathname === `/project/${projectId}/kanban` ? 'active' : ''}><i className="fas fa-columns"></i> Kanban Board</Link></li>
            <li><Link to={`/project/${projectId}/tasks`} className={location.pathname === `/project/${projectId}/tasks` ? 'active' : ''}><i className="fas fa-list-check"></i> Tasks</Link></li>
            <li><Link to={`/project/${projectId}/calendar`} className={location.pathname === `/project/${projectId}/calendar` ? 'active' : ''}><i className="far fa-calendar"></i> Calendar</Link></li>
            <li><Link to={`/project/${projectId}/discussion`} className={location.pathname === `/project/${projectId}/discussion` ? 'active' : ''}><i className="fas fa-comments"></i> Discussion</Link></li>
            <li><Link to={`/project/${projectId}/files`} className={location.pathname === `/project/${projectId}/files` ? 'active' : ''}><i className="fas fa-folder"></i> Files</Link></li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav