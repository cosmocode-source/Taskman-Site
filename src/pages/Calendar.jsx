import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import './Pages.css'

function Calendar() {
  const { projectId } = useParams()
  const [currentDate] = useState(new Date(2025, 10, 1)) // November 2025

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate()

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay()

  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const today = new Date().getDate()
  const currentMonth = new Date().getMonth()

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="page-header">
            <h1 className="page-title">Calendar</h1>
            <p className="page-subtitle">View tasks in calendar format for Project #{projectId}</p>
          </div>

          <div className="calendar-container">
            <div className="calendar-header">
              <h2 className="calendar-title">{monthName}</h2>
              <div className="calendar-nav">
                <button className="calendar-nav-btn">← Previous</button>
                <button className="calendar-nav-btn">Today</button>
                <button className="calendar-nav-btn">Next →</button>
              </div>
            </div>

            <div className="calendar-grid">
              {dayNames.map(day => (
                <div key={day} className="calendar-day-header">{day}</div>
              ))}
              
              {[...Array(firstDayOfMonth)].map((_, index) => (
                <div key={`empty-${index}`} className="calendar-day" style={{ opacity: 0.3 }}></div>
              ))}

              {[...Array(daysInMonth)].map((_, index) => {
                const day = index + 1
                const isToday = day === today && currentDate.getMonth() === currentMonth
                
                return (
                  <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                  >
                    <div className="day-number">{day}</div>
                  </div>
                )
              })}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <h3 style={{ color: '#ffffff', marginBottom: '1rem' }}>Upcoming Deadlines</h3>
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h3 className="empty-title">No upcoming deadlines</h3>
              <p className="empty-description">
                Your tasks with due dates will appear here
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Calendar
