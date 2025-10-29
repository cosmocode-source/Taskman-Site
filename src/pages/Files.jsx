import React from 'react'
import { useParams } from 'react-router-dom'
import Nav from '../components/Nav'

function Files() {
  const { projectId } = useParams()

  return (
    <>
      <Nav />
      <div className="page-content">
        <h1>Files</h1>
        <p>Project files for Project #{projectId}</p>
      </div>
    </>
  )
}

export default Files
