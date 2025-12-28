import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import connectDB from './config/db.js'
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js'
import projectsRouter from './routes/projects.js'
import taskRoutes from './routes/tasks.js'
import fileRoutes from './routes/files.js'
import discussionRoutes from './routes/discussions.js'
import announcementRoutes from './routes/announcements.js'
import invitationRoutes from './routes/invitations.js'

dotenv.config()

// Connect to MongoDB
connectDB()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/projects', projectsRouter)
app.use('/api/tasks', taskRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/discussions', discussionRoutes)
app.use('/api/announcements', announcementRoutes)
app.use('/api/invitations', invitationRoutes)

//Ths is for the tunnling for the ngrok

app.use(express.static(path.join(__dirname, "../dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist", "index.html"));
});


// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
