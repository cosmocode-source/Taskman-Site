import express from 'express'
import ProjectInvitation from '../models/ProjectInvitation.js'
import Project from '../models/Project.js'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/invitations/user/:userEmail
// @desc    Get all pending invitations for a user
router.get('/user/:userEmail', async (req, res) => {
    try {
        const email = req.params.userEmail.toLowerCase()

        const invitations = await ProjectInvitation.find({
            email,
            status: 'pending'
        })
            .populate('project', 'name description color')
            .populate('invitedBy', 'name username')
            .sort({ createdAt: -1 })

        res.json(invitations)
    } catch (error) {
        console.error('Error fetching invitations:', error)
        res.status(500).json({ message: 'Server error fetching invitations' })
    }
})

// @route   POST /api/invitations/:id/accept
// @desc    Accept a project invitation
router.post('/:id/accept', async (req, res) => {
    try {
        const invitation = await ProjectInvitation.findById(req.params.id)

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' })
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation has already been processed' })
        }

        // Find user by email
        const user = await User.findOne({ email: invitation.email.toLowerCase() })
        if (!user) {
            return res.status(404).json({ message: 'User not found' })
        }

        // Add user to project members
        const project = await Project.findById(invitation.project)
        if (!project) {
            return res.status(404).json({ message: 'Project not found' })
        }

        // Check if already a member
        if (!project.members.includes(user._id)) {
            project.members.push(user._id)
            await project.save()
        }

        // Update invitation status
        invitation.status = 'accepted'
        invitation.invitedUser = user._id
        await invitation.save()

        const updatedProject = await Project.findById(project._id)
            .populate('owner', 'name username email avatar')
            .populate('members', 'name username email avatar')

        res.json({
            message: 'Invitation accepted successfully',
            project: updatedProject,
            invitation
        })
    } catch (error) {
        console.error('Error accepting invitation:', error)
        res.status(500).json({ message: 'Server error accepting invitation' })
    }
})

// @route   POST /api/invitations/:id/reject
// @desc    Reject a project invitation
router.post('/:id/reject', async (req, res) => {
    try {
        const invitation = await ProjectInvitation.findById(req.params.id)

        if (!invitation) {
            return res.status(404).json({ message: 'Invitation not found' })
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({ message: 'Invitation has already been processed' })
        }

        // Update invitation status
        invitation.status = 'rejected'
        await invitation.save()

        res.json({
            message: 'Invitation rejected',
            invitation
        })
    } catch (error) {
        console.error('Error rejecting invitation:', error)
        res.status(500).json({ message: 'Server error rejecting invitation' })
    }
})

// @route   POST /api/invitations/create
// @desc    Create project invitations (when creating a project)
router.post('/create', async (req, res) => {
    try {
        const { projectId, emails, invitedBy } = req.body

        if (!projectId || !emails || !invitedBy) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const invitations = []

        for (const email of emails) {
            // Check if invitation already exists
            const existing = await ProjectInvitation.findOne({
                project: projectId,
                email: email.toLowerCase(),
                status: 'pending'
            })

            if (!existing) {
                const invitation = await ProjectInvitation.create({
                    project: projectId,
                    email: email.toLowerCase(),
                    invitedBy
                })
                invitations.push(invitation)
            }
        }

        res.status(201).json({
            message: 'Invitations sent successfully',
            invitations
        })
    } catch (error) {
        console.error('Error creating invitations:', error)
        res.status(500).json({ message: 'Server error creating invitations' })
    }
})

export default router
