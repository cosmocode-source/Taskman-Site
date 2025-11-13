import express from 'express'
import Project from '../models/Project.js'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/projects
// @desc    Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar')
            .sort({ createdAt: -1 })

        res.json(projects)
    } catch (error) {
        console.error('Error fetching projects:', error)
        res.status(500).json({ message: 'Server error fetching projects' })
    }
})

// @route   GET /api/projects/:id
// @desc    Get single project
router.get('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar')

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        res.json(project)
    } catch (error) {
        console.error('Error fetching project:', error)
        res.status(500).json({ message: 'Server error fetching project' })
    }
})

// @route   POST /api/projects
// @desc    Create a new project
router.post('/', async (req, res) => {
    try {
        const { name, description, color, owner, members } = req.body

        // Validation
        if (!name) {
            return res.status(400).json({ message: 'Project name is required' })
        }

        // Get a default owner if not provided (use first user in DB for demo)
        let projectOwner = owner
        if (!projectOwner) {
            const firstUser = await User.findOne()
            if (firstUser) {
                projectOwner = firstUser._id
            }
        }

        const project = await Project.create({
            name,
            description: description || '',
            color: color || '#3498db',
            owner: projectOwner,
            members: members || []
        })

        const populatedProject = await Project.findById(project._id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar')

        res.status(201).json(populatedProject)
    } catch (error) {
        console.error('Error creating project:', error)
        res.status(500).json({ message: 'Server error creating project' })
    }
})

// @route   PUT /api/projects/:id
// @desc    Update a project
router.put('/:id', async (req, res) => {
    try {
        const { name, description, color, members } = req.body

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        if (name) project.name = name
        if (description !== undefined) project.description = description
        if (color) project.color = color
        if (members) project.members = members

        await project.save()

        const updatedProject = await Project.findById(project._id)
            .populate('owner', 'name email avatar')
            .populate('members', 'name email avatar')

        res.json(updatedProject)
    } catch (error) {
        console.error('Error updating project:', error)
        res.status(500).json({ message: 'Server error updating project' })
    }
})

// @route   DELETE /api/projects/:id
// @desc    Delete a project
router.delete('/:id', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        await Project.findByIdAndDelete(req.params.id)
        res.json({ message: 'Project deleted successfully' })
    } catch (error) {
        console.error('Error deleting project:', error)
        res.status(500).json({ message: 'Server error deleting project' })
    }
})

export default router
