import express from 'express'
import Task from '../models/Task.js'
import Notification from '../models/Notification.js'

const router = express.Router()

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId })
            .populate('assignedTo', 'name username email')
            .sort({ createdAt: -1 })
        
        res.json(tasks)
    } catch (error) {
        console.error('Error fetching tasks:', error)
        res.status(500).json({ message: 'Server error fetching tasks' })
    }
})

// @route   GET /api/tasks/:id
// @desc    Get single task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name username email')

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json(task)
    } catch (error) {
        console.error('Error fetching task:', error)
        res.status(500).json({ message: 'Server error fetching task' })
    }
})

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', async (req, res) => {
    try {
        const { projectId, title, description, status, priority, dueDate, assignedTo } = req.body

        if (!title || !projectId) {
            return res.status(400).json({ message: 'Title and project are required' })
        }

        const task = await Task.create({
            projectId,
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate,
            assignedTo
        })

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name username email')

        // Create notification if task is assigned to someone
        if (assignedTo) {
            try {
                await Notification.create({
                    recipient: assignedTo,
                    type: 'task_assigned',
                    title: 'New Task Assigned',
                    message: `You have been assigned to: ${title}`,
                    relatedTask: task._id,
                    relatedProject: projectId,
                    link: `/project/${projectId}/tasks`
                })
            } catch (err) {
                console.error('Error creating notification:', err)
            }
        }

        res.status(201).json(populatedTask)
    } catch (error) {
        console.error('Error creating task:', error)
        res.status(500).json({ message: 'Server error creating task' })
    }
})

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate } = req.body

        const task = await Task.findById(req.params.id)
        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        const oldStatus = task.status

        task.title = title || task.title
        task.description = description !== undefined ? description : task.description
        task.status = status || task.status
        task.priority = priority || task.priority
        task.dueDate = dueDate !== undefined ? dueDate : task.dueDate

        await task.save()

        const populatedTask = await Task.findById(task._id)
            .populate('assignedTo', 'name username email')

        // Create notification if task was completed
        if (status === 'done' && oldStatus !== 'done' && task.assignedTo) {
            try {
                await Notification.create({
                    recipient: task.assignedTo,
                    type: 'task_completed',
                    title: 'Task Completed',
                    message: `Task "${task.title}" has been marked as complete`,
                    relatedTask: task._id,
                    relatedProject: task.projectId,
                    link: `/project/${task.projectId}/tasks`
                })
            } catch (err) {
                console.error('Error creating notification:', err)
            }
        }

        res.json(populatedTask)
    } catch (error) {
        console.error('Error updating task:', error)
        res.status(500).json({ message: 'Server error updating task' })
    }
})

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        await Task.findByIdAndDelete(req.params.id)
        res.json({ message: 'Task deleted successfully' })
    } catch (error) {
        console.error('Error deleting task:', error)
        res.status(500).json({ message: 'Server error deleting task' })
    }
})

export default router
