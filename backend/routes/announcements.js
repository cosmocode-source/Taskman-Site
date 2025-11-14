import express from 'express'
import Announcement from '../models/Announcement.js'
import Project from '../models/Project.js'

const router = express.Router()

// @route   GET /api/announcements
// @desc    Get announcements from user's projects
router.get('/', async (req, res) => {
    try {
        // Get all active announcements (without user filtering for now)
        const announcements = await Announcement.find({
            isActive: true
        })
            .populate('project', 'name color')
            .populate('createdBy', 'name username')
            .sort({ createdAt: -1 })
            .limit(10)

        res.json(announcements)
    } catch (error) {
        console.error('Error fetching announcements:', error)
        res.status(500).json({ message: 'Server error fetching announcements' })
    }
})

// @route   GET /api/announcements/project/:projectId
// @desc    Get announcements for a specific project
router.get('/project/:projectId', async (req, res) => {
    try {
        const announcements = await Announcement.find({
            isActive: true,
            project: req.params.projectId
        })
            .populate('createdBy', 'name username')
            .sort({ createdAt: -1 })

        res.json(announcements)
    } catch (error) {
        console.error('Error fetching project announcements:', error)
        res.status(500).json({ message: 'Server error fetching announcements' })
    }
})

// @route   POST /api/announcements
// @desc    Create a new announcement for a project
router.post('/', async (req, res) => {
    try {
        const { title, description, projectId, icon, priority } = req.body

        if (!title || !description || !projectId) {
            return res.status(400).json({ message: 'Title, description, and project are required' })
        }

        // Verify project exists
        const project = await Project.findById(projectId)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Create announcement
        const announcement = await Announcement.create({
            title,
            description,
            project: projectId,
            icon: icon || 'fas fa-bullhorn',
            priority: priority || 'medium',
            isActive: true,
            createdBy: project.owner // Use project owner as creator
        })

        const populatedAnnouncement = await Announcement.findById(announcement._id)
            .populate('project', 'name color')
            .populate('createdBy', 'name username')

        res.status(201).json(populatedAnnouncement)
    } catch (error) {
        console.error('Error creating announcement:', error)
        res.status(500).json({ message: 'Server error creating announcement' })
    }
})

// @route   DELETE /api/announcements/:id
// @desc    Delete an announcement
router.delete('/:id', async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id)

        if (!announcement) {
            return res.status(404).json({ message: 'Announcement not found' })
        }

        await Announcement.findByIdAndDelete(req.params.id)
        res.json({ message: 'Announcement deleted successfully' })
    } catch (error) {
        console.error('Error deleting announcement:', error)
        res.status(500).json({ message: 'Server error deleting announcement' })
    }
})

export default router
