// filepath: c:\Users\arinv\Downloads\College Projects\webtech\Taskman-Site\src\pages\CompletedProjects.jsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import { projectsAPI, tasksAPI } from '../services/api'
import './Pages.css'

function CompletedProjects() {
  const [projects, setProjects] = useState([])
  const [stats, setStats] = useState({}) // projectId -> stats
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await projectsAPI.getAll()
        const allProjects = res.data || []
        const completed = allProjects.filter(p => p.status === 'completed')
        setProjects(completed)

        // fetch tasks for each completed project and build stats
        const statsMap = {}
        await Promise.all(
          completed.map(async (project) => {
            try {
              const tRes = await tasksAPI.getByProject(project._id)
              const tasks = tRes.data || []

              const total = tasks.length
              const completedTasks = tasks.filter(t => t.status === 'done')
              const members = project.members || []

              const perMember = {}

              members.forEach(m => {
                const uid = m.user?._id || m._id
                if (!uid) return
                perMember[uid] = {
                  user: m.user || m,
                  assigned: 0,
                  done: 0
                }
              })

              tasks.forEach(task => {
                const uid = task.assignedTo?._id || task.assignedTo
                if (!uid || !perMember[uid]) return
                perMember[uid].assigned += 1
                if (task.status === 'done') {
                  perMember[uid].done += 1
                }
              })

              statsMap[project._id] = {
                totalTasks: total,
                completedTasks: completedTasks.length,
                perMember
              }
            } catch (e) {
              console.error('Error loading tasks for project', project._id, e)
            }
          })
        )

        setStats(statsMap)
        setError(null)
      } catch (e) {
        console.error('Error loading completed projects:', e)
        setError('Failed to load completed projects.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  if (loading) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <div className="loading">
            <i className="fas fa-spinner fa-spin" /> Loading completed projects...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="page-content">
          <div className="error">{error}</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Completed Projects</h2>
            <Link to="/projects" className="view-all-link">
              Back to Active Projects
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="empty-message">
              No completed projects yet. Mark a project as completed from its Kanban board to see it here.
            </div>
          ) : (
            <div className="project-overview-grid">
              {projects.map(project => {
                const projectStats = stats[project._id]
                const totalTasks = projectStats?.totalTasks ?? 0
                const completedTasks = projectStats?.completedTasks ?? 0
                const completionPct = totalTasks === 0
                  ? 0
                  : Math.round((completedTasks / totalTasks) * 100)

                return (
                  <div
                    key={project._id}
                    className="project-overview-card completed-project-card"
                    style={{ borderLeftColor: project.color || '#2ecc71' }}
                  >
                    <div className="project-overview-header">
                      <h3>{project.name}</h3>
                      <span className="completed-badge">
                        <i className="fas fa-check-circle"></i> Completed
                        {project.completedAt && (
                          <> · {new Date(project.completedAt).toLocaleDateString()}</>
                        )}
                      </span>
                    </div>

                    <p className="project-synopsis">
                      {project.description || 'No description available'}
                    </p>

                    {/* high-level stats */}
                    <div className="project-summary-row">
                      <div className="summary-chip">
                        <span className="summary-label">Total tasks</span>
                        <span className="summary-value">{totalTasks}</span>
                      </div>
                      <div className="summary-chip">
                        <span className="summary-label">Completed</span>
                        <span className="summary-value">{completedTasks}</span>
                      </div>
                      <div className="summary-chip">
                        <span className="summary-label">Completion</span>
                        <span className="summary-value">{completionPct}%</span>
                      </div>
                    </div>

                    {/* per-member stats */}
                    {projectStats && (
                      <div className="member-stats">
                        <div className="member-stats-header">
                          Team contribution
                        </div>
                        <div className="member-stats-list">
                          {Object.values(projectStats.perMember).map((m) => {
                            const assigned = m.assigned
                            const done = m.done
                            const pct = assigned === 0
                              ? 0
                              : Math.round((done / assigned) * 100)
                            return (
                              <div
                                key={m.user._id}
                                className="member-stat-row"
                              >
                                <div className="member-name-col">
                                  <div className="member-avatar-mini">
                                    {m.user.name?.[0] || '?'}
                                  </div>
                                  <div>
                                    <div className="member-name">
                                      {m.user.name}
                                    </div>
                                    {m.user.username && (
                                      <div className="member-username">
                                        @{m.user.username}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="member-numbers">
                                  <span>{done}/{assigned} tasks</span>
                                  <span className="member-pct">{pct}%</span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    <div className="project-status">
                      <Link
                        to={`/project/${project._id}/tasks`}
                        className="view-btn"
                      >
                        View Board
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default CompletedProjects