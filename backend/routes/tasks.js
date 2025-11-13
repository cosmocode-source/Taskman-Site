import express from 'express'
import Task from '../models/Task.js'

const router = express.Router()

// @route   GET /api/tasks/project/:projectId
// @desc    Get all tasks for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const tasks = await Task.find({ projectId: req.params.projectId })
            .populate('assignedTo', 'name email')
            .populate('projectId', 'name')
        res.json(tasks)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/tasks/:id
// @desc    Get single task
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id)
            .populate('assignedTo', 'name email')
            .populate('projectId', 'name')

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json(task)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/tasks
// @desc    Create a new task
router.post('/', async (req, res) => {
    try {
        const { projectId, title, description, status, priority, dueDate, assignedTo } = req.body

        const newTask = await Task.create({
            projectId,
            title,
            description,
            status: status || 'todo',
            priority: priority || 'medium',
            dueDate,
            assignedTo
        })

        res.status(201).json(newTask)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   PUT /api/tasks/:id
// @desc    Update a task
router.put('/:id', async (req, res) => {
    try {
        const { title, description, status, priority, dueDate, assignedTo } = req.body

        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { title, description, status, priority, dueDate, assignedTo },
            { new: true, runValidators: true }
        )

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json(task)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   DELETE /api/tasks/:id
// @desc    Delete a task
router.delete('/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id)

        if (!task) {
            return res.status(404).json({ message: 'Task not found' })
        }

        res.json({ message: 'Task deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
