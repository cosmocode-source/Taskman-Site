import { useState, useEffect, useRef } from 'react'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { useToast } from './ToastProvider'
import './Nav.css'

function Nav() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const [user, setUser] = useState(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [previousCount, setPreviousCount] = useState(0)
  const notificationRef = useRef(null)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
      const parsedUser = JSON.parse(userData)
      fetchNotifications(parsedUser._id)
      fetchUnreadCount(parsedUser._id)
      
      // Poll for new notifications every 30 seconds
      const pollInterval = setInterval(() => {
        fetchUnreadCount(parsedUser._id)
      }, 30000)
      
      return () => clearInterval(pollInterval)
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

  const fetchNotifications = async (userId) => {
    try {
      const response = await notificationsAPI.getByUser(userId, { limit: 10 })
      setNotifications(response.data)
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  const fetchUnreadCount = async (userId) => {
    try {
      const response = await notificationsAPI.getUnreadCount(userId)
      const newCount = response.data.count
      
      // Show toast if count increased (new notification)
      if (newCount > previousCount && previousCount > 0) {
        const diff = newCount - previousCount
        showToast(
          diff === 1 ? 'You have a new notification' : `You have ${diff} new notifications`,
          'notification'
        )
      }
      
      setPreviousCount(newCount)
      setUnreadCount(newCount)
    } catch (error) {
      console.error('Error fetching unread count:', error)
    }
  }

  const handleNotificationClick = async () => {
    setShowNotifications(!showNotifications)
    if (!showNotifications && user) {
      // Fetch latest notifications when opening
      await fetchNotifications(user._id)
    }
  }

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId)
      setNotifications(notifications.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(Math.max(0, unreadCount - 1))
    } catch (error) {
      console.error('Error marking notification as read:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!user) return
    try {
      await notificationsAPI.markAllAsRead(user._id)
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error marking all as read:', error)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/signin')
  }

  const getNotificationIcon = (type) => {
    const iconMap = {
      'task_assigned': 'fas fa-tasks',
      'task_updated': 'fas fa-edit',
      'task_completed': 'fas fa-check-circle',
      'project_invitation': 'fas fa-envelope',
      'member_added': 'fas fa-user-plus',
      'announcement': 'fas fa-bullhorn',
      'discussion_mention': 'fas fa-at',
      'file_uploaded': 'fas fa-file-upload'
    }
    return iconMap[type] || 'fas fa-bell'
  }

  const formatNotificationTime = (date) => {
    const now = new Date()
    const notifDate = new Date(date)
    const diffMs = now - notifDate
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return notifDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
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
                  {unreadCount > 0 && (
                    <span className="notification-badge">{unreadCount}</span>
                  )}
                </button>
                {showNotifications && (
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h3>Notifications</h3>
                      <div className="notification-actions">
                        {unreadCount > 0 && (
                          <button 
                            className="mark-all-read"
                            onClick={handleMarkAllAsRead}
                            title="Mark all as read"
                          >
                            <i className="fas fa-check-double"></i>
                          </button>
                        )}
                        <button 
                          className="close-notifications"
                          onClick={() => setShowNotifications(false)}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    </div>
                    <div className="notifications-list">
                      {notifications.length > 0 ? (
                        <>
                          {notifications.map(notification => (
                            <div 
                              key={notification._id} 
                              className={`notification-item ${!notification.read ? 'unread' : ''}`}
                              onClick={() => {
                                if (!notification.read) {
                                  handleMarkAsRead(notification._id)
                                }
                                if (notification.link) {
                                  navigate(notification.link)
                                  setShowNotifications(false)
                                }
                              }}
                              style={{ cursor: notification.link ? 'pointer' : 'default' }}
                            >
                              <div className="notification-icon">
                                <i className={getNotificationIcon(notification.type)}></i>
                              </div>
                              <div className="notification-content">
                                <div className="notification-title">{notification.title}</div>
                                <div className="notification-desc">{notification.message}</div>
                                {notification.relatedProject && (
                                  <div className="notification-project" style={{ color: notification.relatedProject.color }}>
                                    <i className="fas fa-folder"></i> {notification.relatedProject.name}
                                  </div>
                                )}
                                <div className="notification-time">
                                  {formatNotificationTime(notification.createdAt)}
                                </div>
                              </div>
                              {!notification.read && (
                                <div className="unread-indicator"></div>
                              )}
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
            <li><Link to={`/project/${projectId}/settings`} className={location.pathname === `/project/${projectId}/settings` ? 'active' : ''}><i className="fas fa-cog"></i> Settings</Link></li>
          </ul>
        </div>
      )}
    </nav>
  )
}

export default Nav