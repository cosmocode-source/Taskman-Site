import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import { ToastProvider } from './components/ToastProvider'

// Import page components
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Dashboard from './pages/Dashboard'
import Announcements from './pages/Announcements'
import Invitations from './pages/Invitations'
import Projects from './pages/Projects'
import NewProject from './pages/NewProject'
import Tasks from './pages/Tasks'
import KanbanBoard from './pages/KanbanBoard'
import Calendar from './pages/Calendar'
import Discussion from './pages/Discussion'
import Files from './pages/Files'
import CompletedProjects from './pages/CompletedProjects'
import ProjectSettings from './pages/ProjectSettings'

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/projects/new" 
          element={
            <ProtectedRoute>
              <NewProject />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/all-tasks" 
          element={
            <ProtectedRoute>
              <Projects />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/announcements" 
          element={
            <ProtectedRoute>
              <Announcements />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/invitations" 
          element={
            <ProtectedRoute>
              <Invitations />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/tasks" 
          element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/kanban" 
          element={
            <ProtectedRoute>
              <KanbanBoard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/calendar" 
          element={
            <ProtectedRoute>
              <Calendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/discussion" 
          element={
            <ProtectedRoute>
              <Discussion />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/files" 
          element={
            <ProtectedRoute>
              <Files />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/project/:projectId/settings" 
          element={
            <ProtectedRoute>
              <ProjectSettings />
            </ProtectedRoute>
          } 
        />
        <Route path="/projects/completed" element={<CompletedProjects />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ToastProvider>
  )
}

export default App