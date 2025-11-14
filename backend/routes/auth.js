import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, username, email, password } = req.body

        // Validation
        if (!name || !username || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Validate username format
        const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
        if (!usernameRegex.test(username)) {
            return res.status(400).json({
                message: 'Username must be 3-20 characters and can only contain letters, numbers, and underscores'
            })
        }

        // Check if user exists with email or username
        const emailExists = await User.findOne({ email: email.toLowerCase() })
        if (emailExists) {
            return res.status(400).json({ message: 'User already exists with this email' })
        }

        const usernameExists = await User.findOne({ username: username.toLowerCase() })
        if (usernameExists) {
            return res.status(400).json({ message: 'Username is already taken' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const user = await User.create({
            name,
            username: username.toLowerCase(),
            email: email.toLowerCase(),
            password: hashedPassword
        })

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '30d' }
        )

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Registration error:', error)
        res.status(500).json({ message: 'Server error during registration' })
    }
})

// @route   POST /api/auth/login
// @desc    Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // Validation
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password' })
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email or password' })
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET || 'your_jwt_secret_key',
            { expiresIn: '30d' }
        )

        res.json({
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                avatar: user.avatar
            }
        })
    } catch (error) {
        console.error('Login error:', error)
        res.status(500).json({ message: 'Server error during login' })
    }
})

export default router
