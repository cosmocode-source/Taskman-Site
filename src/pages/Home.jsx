import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

function Home() {
  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="hero">
          <h1 className="title">Welcome to TaskMan</h1>
          <p className="lead">Organize, prioritize and finish — simple, secure task management for teams and individuals.</p>
          <Link to="/projects" className="cta-button">View My Projects</Link>
        </div>
      </div>
    </>
  )
}

export default Home
