import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    avatar: {
        type: String,
        default: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
})

const User = mongoose.model('User', userSchema)

export default User
