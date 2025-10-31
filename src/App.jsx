import React from 'react'
import './App.css'
import {BrowserRouter, Routes, Route} from 'react-router-dom'

// Import page components
import Home from './pages/Home'
import Projects from './pages/Projects'
import Tasks from './pages/Tasks'
import Calendar from './pages/Calendar'
import Discussion from './pages/Discussion'
import Files from './pages/Files'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/project/:projectId/tasks" element={<Tasks />} />
        <Route path="/project/:projectId/calendar" element={<Calendar />} />
        <Route path="/project/:projectId/discussion" element={<Discussion />} />
        <Route path="/project/:projectId/files" element={<Files />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App