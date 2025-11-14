import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    color: {
        type: String,
        default: '#3498db'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    status: {
        type: String,
        enum: ['active', 'completed'],
        default: 'active'
    },
    completedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
})

const Project = mongoose.model('Project', projectSchema)

export default Project
