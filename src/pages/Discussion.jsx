import React from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'

function Discussion() {
  const { projectId } = useParams()

  return (
    <>
      <Nav />
      <div className="page-content">
        <h1>Discussion</h1>
        <p>Team discussions for Project #{projectId}</p>
      </div>
    </>
  )
}

export default Discussion
