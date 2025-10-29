import React from 'react'
import { Link } from 'react-router-dom'
import Nav from '../components/Nav'

function Projects() {
  // Sample projects - replace with actual data later
  const projects = [
    { id: 1, name: 'Website Redesign', description: 'Redesign company website', color: '#3498db' },
    { id: 2, name: 'Mobile App', description: 'Build mobile application', color: '#e74c3c' },
    { id: 3, name: 'Marketing Campaign', description: 'Q4 marketing strategy', color: '#2ecc71' },
  ]

  return (
    <>
      <Nav />
      <div className="page-content">
        <h1>My Projects</h1>
        <div className="projects-grid">
          {projects.map(project => (
            <Link 
              key={project.id} 
              to={`/project/${project.id}/tasks`} 
              className="project-card"
              style={{ borderLeft: `4px solid ${project.color}` }}
            >
              <h3>{project.name}</h3>
              <p>{project.description}</p>
            </Link>
          ))}
        </div>
      </div>

      <style jsx>{`
        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }

        .project-card {
          background: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .project-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0,0,0,0.15);
        }

        .project-card h3 {
          margin: 0 0 0.5rem 0;
          color: #2c3e50;
        }

        .project-card p {
          margin: 0;
          color: #7f8c8d;
        }
      `}</style>
    </>
  )
}

export default Projects
