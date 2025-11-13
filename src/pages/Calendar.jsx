import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import { tasksAPI } from '../services/api'
import './Pages.css'

function Calendar() {
  const { projectId } = useParams()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await tasksAPI.getByProject(projectId)
        setTasks(response.data)
        setError(null)
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load tasks')
        console.error('Error fetching tasks:', err)
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchTasks()
    }
  }, [projectId])

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    return { daysInMonth, startingDayOfWeek }
  }

  const getTasksForDate = (day) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false
      const taskDate = new Date(task.dueDate)
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      )
    })
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate)
  const today = new Date()
  const isCurrentMonth = 
    today.getMonth() === currentDate.getMonth() &&
    today.getFullYear() === currentDate.getFullYear()

  if (loading) {
    return (
      <>
        <Nav />
        <div className="calendar-page">
          <div className="page-header">
            <h1>Calendar</h1>
          </div>
          <div className="loading">
            <i className="fas fa-spinner fa-spin"></i> Loading calendar...
          </div>
        </div>
      </>
    )
  }

  if (error) {
    return (
      <>
        <Nav />
        <div className="calendar-page">
          <div className="page-header">
            <h1>Calendar</h1>
          </div>
          <div className="error">
            <i className="fas fa-exclamation-triangle"></i> {error}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Nav />
      <div className="calendar-page">
        <div className="page-header">
          <h1>Calendar</h1>
        </div>

        <div className="calendar-grid">
          <div className="calendar-header">
            <div className="calendar-month">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </div>
            <div className="calendar-nav">
              <button onClick={handlePrevMonth} className="nav-btn">
                <i className="fas fa-chevron-left"></i>
              </button>
              <button onClick={handleToday} className="nav-btn">
                Today
              </button>
              <button onClick={handleNextMonth} className="nav-btn">
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>

          <div className="calendar-weekdays">
            {weekDays.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>

          <div className="calendar-days">
            {/* Empty cells for days before the first day of the month */}
            {Array.from({ length: startingDayOfWeek }).map((_, index) => (
              <div key={`empty-${index}`} className="calendar-day empty"></div>
            ))}

            {/* Calendar days */}
            {Array.from({ length: daysInMonth }).map((_, index) => {
              const day = index + 1
              const dayTasks = getTasksForDate(day)
              const isToday = isCurrentMonth && day === today.getDate()

              return (
                <div
                  key={day}
                  className={`calendar-day ${isToday ? 'today' : ''}`}
                >
                  <div className="day-number">{day}</div>
                  <div className="day-events">
                    {dayTasks.slice(0, 3).map(task => (
                      <div
                        key={task._id}
                        className="day-event"
                        title={task.title}
                        style={{
                          backgroundColor: 
                            task.priority === 'high' ? '#f8d7da' :
                            task.priority === 'medium' ? '#fff3cd' :
                            '#d1ecf1'
                        }}
                      >
                        <span className="event-title">{task.title}</span>
                      </div>
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="more-events">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Task Legend */}
        <div className="calendar-legend">
          <h3>Task Priority</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f8d7da' }}></span>
              High Priority
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#fff3cd' }}></span>
              Medium Priority
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#d1ecf1' }}></span>
              Low Priority
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Calendar
