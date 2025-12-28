import express from 'express'
import Notification from '../models/Notification.js'

const router = express.Router()

// @route   GET /api/notifications/user/:userId
// @desc    Get all notifications for a user
router.get('/user/:userId', async (req, res) => {
    try {
        const { limit = 50, unreadOnly = false } = req.query
        
        const query = { recipient: req.params.userId }
        if (unreadOnly === 'true') {
            query.read = false
        }

        const notifications = await Notification.find(query)
            .populate('relatedProject', 'name color')
            .populate('relatedTask', 'title')
            .populate('relatedUser', 'name username')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))

        res.json(notifications)
    } catch (error) {
        console.error('Error fetching notifications:', error)
        res.status(500).json({ message: 'Server error fetching notifications' })
    }
})

// @route   GET /api/notifications/unread-count/:userId
// @desc    Get count of unread notifications for a user
router.get('/unread-count/:userId', async (req, res) => {
    try {
        const count = await Notification.countDocuments({
            recipient: req.params.userId,
            read: false
        })

        res.json({ count })
    } catch (error) {
        console.error('Error counting notifications:', error)
        res.status(500).json({ message: 'Server error counting notifications' })
    }
})

// @route   POST /api/notifications
// @desc    Create a new notification
router.post('/', async (req, res) => {
    try {
        const { recipient, type, title, message, relatedProject, relatedTask, relatedUser, link } = req.body

        if (!recipient || !type || !title || !message) {
            return res.status(400).json({ message: 'Missing required fields' })
        }

        const notification = await Notification.create({
            recipient,
            type,
            title,
            message,
            relatedProject,
            relatedTask,
            relatedUser,
            link
        })

        const populatedNotification = await Notification.findById(notification._id)
            .populate('relatedProject', 'name color')
            .populate('relatedTask', 'title')
            .populate('relatedUser', 'name username')

        res.status(201).json(populatedNotification)
    } catch (error) {
        console.error('Error creating notification:', error)
        res.status(500).json({ message: 'Server error creating notification' })
    }
})

// @route   PATCH /api/notifications/:id/read
// @desc    Mark a notification as read
router.patch('/:id/read', async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        )
            .populate('relatedProject', 'name color')
            .populate('relatedTask', 'title')
            .populate('relatedUser', 'name username')

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        res.json(notification)
    } catch (error) {
        console.error('Error marking notification as read:', error)
        res.status(500).json({ message: 'Server error updating notification' })
    }
})

// @route   PATCH /api/notifications/mark-all-read/:userId
// @desc    Mark all notifications as read for a user
router.patch('/mark-all-read/:userId', async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.params.userId, read: false },
            { read: true }
        )

        res.json({ message: 'All notifications marked as read' })
    } catch (error) {
        console.error('Error marking all notifications as read:', error)
        res.status(500).json({ message: 'Server error updating notifications' })
    }
})

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id)

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' })
        }

        await Notification.findByIdAndDelete(req.params.id)
        res.json({ message: 'Notification deleted successfully' })
    } catch (error) {
        console.error('Error deleting notification:', error)
        res.status(500).json({ message: 'Server error deleting notification' })
    }
})

// @route   DELETE /api/notifications/clear/:userId
// @desc    Delete all read notifications for a user
router.delete('/clear/:userId', async (req, res) => {
    try {
        await Notification.deleteMany({
            recipient: req.params.userId,
            read: true
        })

        res.json({ message: 'Read notifications cleared successfully' })
    } catch (error) {
        console.error('Error clearing notifications:', error)
        res.status(500).json({ message: 'Server error clearing notifications' })
    }
})

export default router
