import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'
import './Pages.css'

function Home() {
  const features = [
    { icon: '📋', title: 'Task Management', description: 'Organize tasks efficiently' },
    { icon: '👥', title: 'Team Collaboration', description: 'Work together seamlessly' },
    { icon: '📅', title: 'Calendar View', description: 'Track deadlines visually' },
    { icon: '💬', title: 'Discussions', description: 'Communicate with your team' },
    { icon: '📁', title: 'File Sharing', description: 'Share documents easily' },
    { icon: '📊', title: 'Progress Tracking', description: 'Monitor project status' },
  ]

  return (
    <>
      <Nav />
      <div className="page-content">
        <div className="page-container">
          <div className="hero">
            <div className="hero-badge">
              <span className="logo">✓</span>
            </div>
            <h1 className="title">Welcome to TaskMan</h1>
            <p className="lead">
              Organize, prioritize and finish — simple, secure task management for teams and individuals.
            </p>
            <div className="hero-actions">
              <Link to="/projects" className="cta-button primary">
                View My Projects
              </Link>
              <Link to="/signup" className="cta-button secondary">
                Get Started
              </Link>
            </div>
          </div>

          <div className="features-section">
            <h2 className="section-title">Everything you need to stay organized</h2>
            <div className="features-grid">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .hero-badge {
          margin-bottom: 1.5rem;
        }

        .hero-badge .logo {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          background-color: #3498db;
          border-radius: 12px;
          font-size: 32px;
          color: white;
          font-weight: 700;
          box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
        }

        .hero-actions {
          display: flex;
          gap: 1rem;
          justify-content: center;
          margin-top: 2rem;
          flex-wrap: wrap;
        }

        .cta-button {
          padding: 0.875rem 2rem;
          border-radius: 6px;
          font-weight: 600;
          font-size: 1rem;
          text-decoration: none;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }

        .cta-button.primary {
          background-color: #3498db;
          color: #ffffff;
        }

        .cta-button.primary:hover {
          background-color: #2980b9;
        }

        .cta-button.secondary {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #cbd5e1;
        }

        .cta-button.secondary:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .features-section {
          margin-top: 4rem;
        }

        .section-title {
          text-align: center;
          font-size: 1.75rem;
          font-weight: 700;
          color: #ffffff;
          margin: 0 0 2.5rem 0;
          letter-spacing: -0.5px;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
        }

        .feature-card {
          background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01));
          border: 1px solid rgba(255, 255, 255, 0.04);
          border-radius: 12px;
          padding: 2rem;
          text-align: center;
          transition: all 0.2s;
        }

        .feature-card:hover {
          transform: translateY(-4px);
          border-color: rgba(255, 255, 255, 0.1);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
        }

        .feature-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.125rem;
          font-weight: 600;
          color: #ffffff;
        }

        .feature-description {
          margin: 0;
          font-size: 0.9rem;
          color: #cbd5e1;
        }

        @media (max-width: 640px) {
          .hero-actions {
            flex-direction: column;
            width: 100%;
          }

          .cta-button {
            width: 100%;
            justify-content: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

export default Home
