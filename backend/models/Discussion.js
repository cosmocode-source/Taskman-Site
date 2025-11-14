import mongoose from 'mongoose'

const discussionSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    },
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    replies: [{
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        message: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    read: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
})

const Discussion = mongoose.model('Discussion', discussionSchema)

export default Discussion
