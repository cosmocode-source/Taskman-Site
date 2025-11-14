import { Link, useLocation, useParams } from 'react-router-dom'
import './ProjectTabs.css'

function ProjectTabs() {
  const location = useLocation()
  const { projectId } = useParams()

  const tabs = [
    { 
      path: `/project/${projectId}/kanban`, 
      label: 'Kanban Board', 
      icon: 'fas fa-columns' 
    },
    { 
      path: `/project/${projectId}/tasks`, 
      label: 'Tasks', 
      icon: 'fas fa-list-check' 
    },
    { 
      path: `/project/${projectId}/calendar`, 
      label: 'Calendar', 
      icon: 'far fa-calendar' 
    },
    { 
      path: `/project/${projectId}/discussion`, 
      label: 'Discussion', 
      icon: 'fas fa-comments' 
    },
    { 
      path: `/project/${projectId}/files`, 
      label: 'Files', 
      icon: 'fas fa-folder' 
    }
  ]

  const isActive = (path) => location.pathname === path

  return (
    <div className="project-tabs">
      <div className="tabs-nav">
        {tabs.map((tab) => (
          <Link
            key={tab.path}
            to={tab.path}
            className={`tab-link ${isActive(tab.path) ? 'active' : ''}`}
          >
            <i className={tab.icon}></i>
            {tab.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ProjectTabs
