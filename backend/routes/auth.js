import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// @route   POST /api/auth/register
// @desc    Register a new user
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Please provide all required fields' })
        }

        // Check if user exists
        const userExists = await User.findOne({ email: email.toLowerCase() })
        if (userExists) {
            return res.status(400).json({ message: 'User already exists with this email' })
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create new user
        const user = await User.create({
            name,
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
