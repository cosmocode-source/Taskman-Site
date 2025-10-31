import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'
import './Pages.css'

function Tasks() {
  const { projectId } = useParams()
  const [filter, setFilter] = useState('all')
  
  const tasks = []

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="tasks-container">
            <div className="tasks-header">
              <div>
                <h1 className="page-title">Tasks</h1>
                <p className="page-subtitle">Project #{projectId}</p>
              </div>
              <button className="add-task-btn">
                <span>+</span>
                Add Task
              </button>
            </div>

            <div className="tasks-filters">
              <button 
                className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                onClick={() => setFilter('all')}
              >
                All Tasks (0)
              </button>
              <button 
                className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
                onClick={() => setFilter('active')}
              >
                Active (0)
              </button>
              <button 
                className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
                onClick={() => setFilter('completed')}
              >
                Completed (0)
              </button>
            </div>

            <div className="empty-state">
              <div className="empty-icon">📋</div>
              <h3 className="empty-title">No tasks found</h3>
              <p className="empty-description">
                Get started by creating your first task
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Tasks
