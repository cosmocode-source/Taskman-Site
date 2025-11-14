import mongoose from 'mongoose'

const projectInvitationSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    invitedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, {
    timestamps: true
})

// Index for faster queries
projectInvitationSchema.index({ project: 1, email: 1 })
projectInvitationSchema.index({ email: 1, status: 1 })

const ProjectInvitation = mongoose.model('ProjectInvitation', projectInvitationSchema)

export default ProjectInvitation
