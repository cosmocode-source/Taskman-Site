import React from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'

function Tasks() {
  const { projectId } = useParams()

  return (
    <>
      <Nav />
      <div className="page-content">
        <h1>Tasks</h1>
        <p>Managing tasks for Project #{projectId}</p>
      </div>
    </>
  )
}

export default Tasks
