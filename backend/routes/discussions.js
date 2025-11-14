import express from 'express'
import Discussion from '../models/Discussion.js'

const router = express.Router()

// @route   GET /api/discussions/project/:projectId
// @desc    Get all discussions for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const discussions = await Discussion.find({ projectId: req.params.projectId })
            .populate('author', 'name username email avatar')
            .populate('replies.author', 'name username email avatar')
            .sort({ createdAt: -1 })

        res.json(discussions)
    } catch (error) {
        console.error('Error fetching discussions:', error)
        res.status(500).json({ message: 'Server error fetching discussions' })
    }
})

// @route   GET /api/discussions/:id
// @desc    Get single discussion
router.get('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('author', 'name username email avatar')
            .populate('replies.author', 'name username email avatar')

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        res.json(discussion)
    } catch (error) {
        console.error('Error fetching discussion:', error)
        res.status(500).json({ message: 'Server error fetching discussion' })
    }
})

// @route   POST /api/discussions
// @desc    Create a new discussion
router.post('/', async (req, res) => {
    try {
        const { projectId, author, message } = req.body

        if (!projectId || !author || !message) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        const discussion = await Discussion.create({
            projectId,
            author,
            message
        })

        const populatedDiscussion = await Discussion.findById(discussion._id)
            .populate('author', 'name username email avatar')

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
