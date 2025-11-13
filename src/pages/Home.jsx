import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Nav from '../components/Nav'

function Home() {
  const navigate = useNavigate()

  useEffect(() => {
    // If user is logged in, redirect to projects
    const token = localStorage.getItem('token')
    if (token) {
      navigate('/projects')
    }
  }, [navigate])

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="hero">
          <h1 className="title">Welcome to TaskMan</h1>
          <p className="lead">Organize, prioritize and finish — simple, secure task management for teams and individuals.</p>
          <div className="hero-actions">
            <Link to="/signup" className="cta-button primary">
              Get Started Free
            </Link>
            <Link to="/signin" className="cta-button secondary">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
