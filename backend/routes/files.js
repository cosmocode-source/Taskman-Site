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

// @route   GET /api/files/:id/download
// @desc    Download file with proper headers
// NOTE: This must come BEFORE the /:id route to avoid being caught by it
router.get('/:id/download', async (req, res) => {
    try {
        const file = await File.findById(req.params.id)

        if (!file) {
            return res.status(404).json({ message: 'File not found' })
        }

        // If file has base64 content, serve it
        if (file.content) {
            const buffer = Buffer.from(file.content, 'base64')
            res.set({
                'Content-Type': file.mimeType || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.name}"`,
                'Content-Length': buffer.length
            })
            return res.send(buffer)
        }

        // If file has a URL, redirect to it
        if (file.url) {
            return res.redirect(file.url)
        }

        // Otherwise send error
        res.status(404).json({ message: 'File content not available' })
    } catch (error) {
        console.error('Error downloading file:', error)
        res.status(500).json({ message: 'Server error downloading file' })
    }
})

// @route   POST /api/files
// @desc    Upload a new file (any project member can upload)
router.post('/', async (req, res) => {
    try {
        const { projectId, name, size, url, content, mimeType, uploadedBy } = req.body

        if (!projectId || !name || !uploadedBy) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        const file = await File.create({
            projectId,
            name,
            size: size || 'Unknown',
            url: url || '',
            content: content || '',
            mimeType: mimeType || 'application/octet-stream',
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
