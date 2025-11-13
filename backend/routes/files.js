import express from 'express'
import File from '../models/File.js'

const router = express.Router()

// @route   GET /api/files/project/:projectId
// @desc    Get all files for a project
router.get('/project/:projectId', async (req, res) => {
    try {
        const files = await File.find({ projectId: req.params.projectId })
            .populate('uploadedBy', 'name email')
            .populate('projectId', 'name')
        res.json(files)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   GET /api/files/:id
// @desc    Get single file
router.get('/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id)
            .populate('uploadedBy', 'name email')

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        res.json(file)
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

// @route   POST /api/files
// @desc    Upload a new file
router.post('/', async (req, res) => {
    try {
        const { projectId, name, size, url, uploadedBy } = req.body

        const newFile = await File.create({
            projectId,
            name,
            size,
            url,
            uploadedBy
        })

        res.status(201).json(newFile)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})

// @route   DELETE /api/files/:id
// @desc    Delete a file
router.delete('/:id', async (req, res) => {
    try {
        const file = await File.findByIdAndDelete(req.params.id)

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        res.json({ message: 'File deleted successfully' })
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

export default router
