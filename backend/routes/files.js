import express from 'express'
import File from '../models/File.js'

const router = express.Router()

// @route   GET /api/files/project/:projectId
// @desc    Get all files for a project (accessible by all project members)
router.get('/project/:projectId', async (req, res) => {
    try {
        const files = await File.find({ projectId: req.params.projectId })
            .populate('uploadedBy', 'name username email avatar')
            .sort({ createdAt: -1 })

        res.json(files)
    } catch (error) {
        console.error('Error fetching files:', error)
        res.status(500).json({ message: 'Server error fetching files' })
    }
})

// @route   GET /api/files/:id
// @desc    Get single file
router.get('/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id)
            .populate('uploadedBy', 'name username email avatar')

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        res.json(file)
    } catch (error) {
        console.error('Error fetching file:', error)
        res.status(500).json({ message: 'Server error fetching file' })
    }
})

// @route   POST /api/files
// @desc    Upload a new file (any project member can upload)
router.post('/', async (req, res) => {
    try {
        const { projectId, name, size, url, uploadedBy } = req.body

        if (!projectId || !name || !uploadedBy) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        const file = await File.create({
            projectId,
            name,
            size: size || 'Unknown',
            url: url || '',
            uploadedBy
        })

        const populatedFile = await File.findById(file._id)
            .populate('uploadedBy', 'name username email avatar')

        res.status(201).json(populatedFile)
    } catch (error) {
        console.error('Error uploading file:', error)
        res.status(500).json({ message: 'Server error uploading file' })
    }
})

// @route   DELETE /api/files/:id
// @desc    Delete a file (any project member can delete)
router.delete('/:id', async (req, res) => {
    try {
        const file = await File.findById(req.params.id)

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        await File.findByIdAndDelete(req.params.id)
        res.json({ message: 'File deleted successfully' })
    } catch (error) {
        console.error('Error deleting file:', error)
        res.status(500).json({ message: 'Server error deleting file' })
    }
})

export default router
