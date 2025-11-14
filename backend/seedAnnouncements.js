import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Announcement from './models/Announcement.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/taskman'

const sampleAnnouncements = [
    {
        title: 'System Maintenance Scheduled',
        description: 'Scheduled maintenance on Nov 20th, 2025',
        icon: 'fas fa-tools',
        priority: 'high',
        isActive: true
    },
    {
        title: 'Community Event',
        description: 'Join our community meetup next week',
        icon: 'fas fa-users',
        priority: 'medium',
        isActive: true
    },
    {
        title: 'New Features Released',
        description: 'Check out our latest updates and improvements',
        icon: 'fas fa-rocket',
        priority: 'medium',
        isActive: true
    }
]

const seedAnnouncements = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('Connected to MongoDB')

        // Clear existing announcements
        await Announcement.deleteMany({})
        console.log('Cleared existing announcements')

        // Insert sample announcements
        await Announcement.insertMany(sampleAnnouncements)
        console.log('Sample announcements added successfully!')

        process.exit(0)
    } catch (error) {
        console.error('Error seeding announcements:', error)
        process.exit(1)
    }
}

seedAnnouncements()
