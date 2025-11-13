import express from 'express'
import Discussion from '../models/Discussion.js'

const router = express.Router()

// @route   GET /api/discussions/project/:projectId
// @desc    Get all discussions for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const discussions = await Discussion.find({ projectId: req.params.projectId })
            .populate('author', 'name email')
            .populate('replies.author', 'name email')
        res.json(discussions)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/discussions/:id
// @desc    Get single discussion
router.get('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findById(req.params.id)
            .populate('author', 'name email')
            .populate('replies.author', 'name email')

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        res.json(discussion)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/discussions
// @desc    Create a new discussion
router.post('/', async (req, res) => {
    try {
        const { projectId, author, message } = req.body

        const newDiscussion = await Discussion.create({
            projectId,
            author,
            message,
            replies: []
        })

        res.status(201).json(newDiscussion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   POST /api/discussions/:id/reply
// @desc    Add a reply to a discussion
router.post('/:id/reply', async (req, res) => {
    try {
        const { author, message } = req.body

        const discussion = await Discussion.findById(req.params.id)

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        discussion.replies.push({ author, message })
        await discussion.save()

        res.json(discussion)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   DELETE /api/discussions/:id
// @desc    Delete a discussion
router.delete('/:id', async (req, res) => {
    try {
        const discussion = await Discussion.findByIdAndDelete(req.params.id)

        if (!discussion) {
            return res.status(404).json({ message: 'Discussion not found' })
        }

        res.json({ message: 'Discussion deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
