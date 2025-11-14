import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'
import { projectsAPI, tasksAPI, announcementsAPI } from '../services/api'
import './Pages.css'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [projects, setProjects] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch all data in parallel
      const [projectsResponse, announcementsResponse] = await Promise.all([
        projectsAPI.getAll(),
        announcementsAPI.getAll()
      ])
      
      const projectsData = projectsResponse.data
      setProjects(projectsData)
      setAnnouncements(announcementsResponse.data)

      // Fetch tasks from all projects
      const tasksPromises = projectsData.map(project => 
        tasksAPI.getByProject(project._id).catch(() => ({ data: [] }))
      )
      const tasksResponses = await Promise.all(tasksPromises)
      
      // Combine all tasks with project info
      const combinedTasks = []
      tasksResponses.forEach((response, index) => {
        const tasks = response.data || []
        tasks.forEach(task => {
          combinedTasks.push({
            ...task,
            projectId: projectsData[index]._id,
            projectName: projectsData[index].name,
            projectColor: projectsData[index].color
          })
        })
      })
      
      setAllTasks(combinedTasks)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get pending tasks (not done)
  const pendingTasks = allTasks.filter(task => task.status !== 'done')
  
  // Get overdue tasks
  const today = new Date()
  const overdueTasks = pendingTasks.filter(task => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < today
  })

  // Get tasks due this week
  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const tasksThisWeek = pendingTasks.filter(task => {
    if (!task.dueDate) return false
    const dueDate = new Date(task.dueDate)
    return dueDate >= today && dueDate <= weekFromNow
  })

  // Get ongoing projects (limit to 2 for overview)
  const ongoingProjects = projects.slice(0, 2)

  const handleTaskClick = (task) => {
    navigate(`/project/${task.projectId}/tasks`)
  }

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading dashboard...
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page-content dashboard">
        {/* Welcome Header */}
        <div className="dashboard-header">
          <h1>Welcome back, {user?.name?.split(' ')[0] || 'User'}!</h1>

          {/* right-side header actions row */}
          <div className="dashboard-header-actions">
            {/* existing header actions like "My Projects", "Logout" should already be here.
                We only add this one small link. */}
            <Link to="/projects/completed" className="header-link">
              <i className="fas fa-check-circle"></i> View Completed Projects
            </Link>
          </div>
        </div>

        {/* Announcements Section */}
        <div className="dashboard-section announcements-section">
          <h2>Project Announcements</h2>
          {announcements.length > 0 ? (
            <>
              <div className="announcements-list">
                {announcements.map(announcement => (
                  <div key={announcement._id} className="announcement-item">
                    <i className={announcement.icon}></i>
                    <div className="announcement-content">
                      <div className="announcement-title">{announcement.title}</div>
                      <div className="announcement-desc">{announcement.description}</div>
                      {announcement.project && (
                        <div className="announcement-project" style={{ color: announcement.project.color }}>
                          <i className="fas fa-folder"></i> {announcement.project.name}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <Link to="/announcements" className="view-all-link">
                View All Announcements
              </Link>
            </>
          ) : (
            <div className="empty-message">No announcements from your projects</div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="dashboard-grid">
          {/* Pending Tasks Section */}
          <div className="dashboard-section tasks-section">
            <div className="section-header">
              <h2>Pending Tasks Overview</h2>
              <Link to="/all-tasks" className="btn-add-small">
                <i className="fas fa-plus"></i>
                Add New Task
              </Link>
            </div>

            {/* Overdue Tasks */}
            {overdueTasks.length > 0 && (
              <div className="task-group">
                <div className="task-group-header overdue">
                  <i className="fas fa-exclamation-circle"></i>
                  OVERDUE ({overdueTasks.length})
                </div>
                {overdueTasks.slice(0, 2).map(task => (
                  <div 
                    key={task._id} 
                    className="task-item clickable"
                    onClick={() => handleTaskClick(task)}
                  >
                    <div className="task-item-content">
                      <span className="task-title">{task.title}</span>
                      <span className="task-project" style={{ color: task.projectColor }}>
                        {task.projectName}
                      </span>
                    </div>
                    <i className="fas fa-chevron-right"></i>
                  </div>
                ))}
              </div>
            )}

            {/* Tasks Due This Week */}
            <div className="task-group">
              <div className="task-group-header">
                <i className="far fa-calendar"></i>
                DUE THIS WEEK ({tasksThisWeek.length})
              </div>
              {tasksThisWeek.slice(0, 4).map(task => (
                <div 
                  key={task._id} 
                  className="task-item clickable"
                  onClick={() => handleTaskClick(task)}
                >
                  <div className="task-item-content">
                    <span className="task-title">{task.title}</span>
                    <span className="task-project" style={{ color: task.projectColor }}>
                      {task.projectName}
                    </span>
                  </div>
                  <i className="fas fa-chevron-right"></i>
                </div>
              ))}
              {tasksThisWeek.length === 0 && (
                <div className="empty-message">No tasks due this week</div>
              )}
            </div>

            <Link to="/all-tasks" className="view-all-link">
              View All My Tasks
            </Link>
          </div>

          {/* Ongoing Projects Section */}
          <div className="dashboard-section projects-section">
            <h2>Ongoing Projects Overview</h2>
            
            <div className="project-overview-grid">
              {ongoingProjects.map(project => (
                <Link
                  key={project._id}
                  to={`/project/${project._id}/tasks`}
                  className="project-overview-card"
                  style={{ borderLeftColor: project.color }}
                >
                  <div className="project-overview-header">
                    <h3>{project.name}</h3>
                  </div>
                  <p className="project-synopsis">
                    {project.description || 'No description available'}
                  </p>
                  <div className="project-status">
                    <div className="status-indicator">
                      <span className="status-dots">●●●</span>
                      <span className="status-text">Status: On Track</span>
                    </div>
                    <button className="view-btn">View Project</button>
                  </div>
                </Link>
              ))}
            </div>

            {projects.length === 0 && (
              <div className="empty-message">
                No projects yet. <Link to="/projects/new" style={{ color: '#3498db' }}>Create your first project!</Link>
              </div>
            )}

            <Link to="/projects" className="view-all-link">
              View All Active Projects
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Dashboard
