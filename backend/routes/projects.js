import express from 'express'
import Project from '../models/Project.js'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/projects
// @desc    Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find()
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')
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
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

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
        const { name, description, color, owner, members, invitedEmails } = req.body

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

        // Process invited members - look up users by email or username
        let memberIds = members || []
        if (invitedEmails && invitedEmails.length > 0) {
            for (const identifier of invitedEmails) {
                // Check if it's an email or username
                const isEmail = identifier.includes('@')
                let user

                if (isEmail) {
                    user = await User.findOne({ email: identifier.toLowerCase() })
                } else {
                    user = await User.findOne({ username: identifier.toLowerCase() })
                }

                if (user && !memberIds.includes(user._id.toString())) {
                    memberIds.push(user._id)
                }
            }
        }

        const project = await Project.create({
            name,
            description: description || '',
            color: color || '#3498db',
            owner: projectOwner,
            members: memberIds
        })

        const populatedProject = await Project.findById(project._id)
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

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
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

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

// @route   POST /api/projects/:id/members
// @desc    Add a member to a project
router.post('/:id/members', async (req, res) => {
    try {
        const { identifier } = req.body // Can be email or username

        if (!identifier) {
            return res.status(400).json({ message: 'Email or username is required' })
        }

        const project = await Project.findById(req.params.id)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Find user by email or username
        const isEmail = identifier.includes('@')
        let user

        if (isEmail) {
            user = await User.findOne({ email: identifier.toLowerCase() })
        } else {
            user = await User.findOne({ username: identifier.toLowerCase() })
        }

        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Check if user is already a member
        if (project.members.includes(user._id)) {
            return res.status(400).json({ message: 'User is already a member of this project' })
        }

        // Add member
        project.members.push(user._id)
        await project.save()

        const updatedProject = await Project.findById(project._id)
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

        res.json(updatedProject)
    } catch (error) {
        console.error('Error adding member:', error)
        res.status(500).json({ message: 'Server error adding member' })
    }
})

// @route   DELETE /api/projects/:id/members/:userId
// @desc    Remove a member from a project
router.delete('/:id/members/:userId', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)

        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Remove member
        project.members = project.members.filter(
            memberId => memberId.toString() !== req.params.userId
        )
        await project.save()

        const updatedProject = await Project.findById(project._id)
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

        res.json(updatedProject)
    } catch (error) {
        console.error('Error removing member:', error)
        res.status(500).json({ message: 'Server error removing member' })
    }
})

export default router
