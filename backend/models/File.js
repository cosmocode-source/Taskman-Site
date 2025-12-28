import mongoose from 'mongoose'

const fileSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    size: {
        type: String
    },
    url: {
        type: String
    },
    content: {
        type: String  // Base64 encoded file content for small files
    },
    mimeType: {
        type: String
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
})

const File = mongoose.model('File', fileSchema)

export default File
