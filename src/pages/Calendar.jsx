import React from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'

function Calendar() {
  const { projectId } = useParams()

  return (
    <>
      <Nav />
      <div className="page-content">
        <h1>Calendar</h1>
        <p>View tasks in calendar format for Project #{projectId}</p>
      </div>
    </>
  )
}

export default Calendar
