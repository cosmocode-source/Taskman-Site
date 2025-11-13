import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route, Navigate} from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'

// Import page components
import Home from './pages/Home'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Discussion from './pages/Discussion'
import Files from './pages/Files'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route 
          path="/projects" 
          element={
            <ProtectedRoute>
              <Projects />
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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App