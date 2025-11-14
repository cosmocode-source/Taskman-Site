import express from 'express'
import Discussion from '../models/Discussion.js'
import mongoose from 'mongoose'

const router = express.Router()

// @route   GET /api/discussions/project/:projectId
// @desc    Get all discussions for a project (public and user's private)
router.get('/project/:projectId', async (req, res) => {
    try {
        const { userId } = req.query
        
        const discussions = await Discussion.find({
            projectId: req.params.projectId,
            $or: [
                { type: 'public' },
                { author: userId, type: 'private' },
                { recipient: userId, type: 'private' }
            ]
        })
            .populate('author', 'name username email avatar')
            .populate('recipient', 'name username email avatar')
            .populate('replies.author', 'name username email avatar')
            .sort({ createdAt: -1 })

        res.json(discussions)
    } catch (error) {
        console.error('Error fetching discussions:', error)
        res.status(500).json({ message: 'Server error fetching discussions' })
    }
})

// @route   GET /api/discussions/chat/:projectId/:userId
// @desc    Get chat messages between user and another user
router.get('/chat/:projectId/:userId', async (req, res) => {
    try {
        const { projectId, userId } = req.params
        const { currentUserId } = req.query
        
        const messages = await Discussion.find({
            projectId,
            type: 'private',
            $or: [
                { author: currentUserId, recipient: userId },
                { author: userId, recipient: currentUserId }
            ]
        })
            .populate('author', 'name username email avatar')
            .populate('recipient', 'name username email avatar')
            .sort({ createdAt: 1 })

        // Mark messages as read
        await Discussion.updateMany(
            {
                projectId,
                type: 'private',
                author: userId,
                recipient: currentUserId,
                read: false
            },
            { read: true }
        )

        res.json(messages)
    } catch (error) {
        console.error('Error fetching chat:', error)
        res.status(500).json({ message: 'Server error fetching chat' })
    }
})

// @route   GET /api/discussions/unread/:projectId/:userId
// @desc    Get unread message counts
router.get('/unread/:projectId/:userId', async (req, res) => {
    try {
        const { projectId, userId } = req.params
        
        const unreadCounts = await Discussion.aggregate([
            {
                $match: {
                    projectId: mongoose.Types.ObjectId(projectId),
                    type: 'private',
                    recipient: mongoose.Types.ObjectId(userId),
                    read: false
                }
            },
            {
                $group: {
                    _id: '$author',
                    count: { $sum: 1 }
                }
            }
        ])

        res.json(unreadCounts)
    } catch (error) {
        console.error('Error fetching unread counts:', error)
        res.status(500).json({ message: 'Server error fetching unread counts' })
    }
})

// @route   POST /api/discussions
// @desc    Create a new discussion or message
router.post('/', async (req, res) => {
    try {
        const { projectId, author, message, type, recipient } = req.body

        if (!projectId || !author || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        if (type === 'private' && !recipient) {
            return res.status(400).json({ message: 'Recipient required for private messages' })
        }

        const discussion = await Discussion.create({
            projectId,
            author,
            message,
            type: type || 'public',
            recipient: recipient || null
        })

        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate('author', 'name username email avatar')
            .populate('recipient', 'name username email avatar')

        res.status(201).json(populatedDiscussion)
    } catch (error) {
        console.error('Error creating discussion:', error)
        res.status(500).json({ message: 'Server error creating discussion' })
    }
})

// @route   POST /api/discussions/:id/reply
// @desc    Add a reply to a discussion
router.post('/:id/reply', async (req, res) => {
    try {
        const { author, message } = req.body

        if (!author || !message) {
            return res.status(400).json({ message: 'Please provide author and message' })
        }

        const discussion = await Discussion.findById(req.params.id)

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        discussion.replies.push({ author, message })
        await discussion.save()

        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate('author', 'name username email avatar')
            .populate('recipient', 'name username email avatar')
            .populate('replies.author', 'name username email avatar')

        res.json(populatedDiscussion)
    } catch (error) {
        console.error('Error adding reply:', error)
        res.status(500).json({ message: 'Server error adding reply' })
    }
})

// @route   DELETE /api/discussions/:id
// @desc    Delete a discussion
router.delete('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        await Discussion.findByIdAndDelete(req.params.id)
        res.json({ message: 'Discussion deleted successfully' })
    } catch (error) {
        console.error('Error deleting discussion:', error)
        res.status(500).json({ message: 'Server error deleting discussion' })
    }
})

export default router
