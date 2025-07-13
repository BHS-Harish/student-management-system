const Teacher = require('../models/Teachers');
const jwt = require('jsonwebtoken');


exports.createTeacher = async (req, res) => {
    try {
        const { name, email, phone, password, department } = req.body;

        // Validations based on Teacher model
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required and must be a non-empty string.' });
        }
        if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'A valid email is required.' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password is required and must be at least 6 characters.' });
        }
        if (phone && (typeof phone !== 'string' || !/^\+?[0-9]{10}$/.test(phone))) {
            return res.status(400).json({ error: 'Phone must be a 10 digits.' });
        }
        if (department && (typeof department !== 'string' || department.trim().length === 0)) {
            return res.status(400).json({ error: 'Department must be a non-empty string if provided.' });
        }

        // Check if email already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const teacher = new Teacher({ name, email, phone, password, department });
        await teacher.save();
        res.status(201).json({  success:true, message: 'Teacher created successfully', teacher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.loginTeacher = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Simple password check (for demo; use hashing in production)
        if (teacher.password !== password) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Generate JWT
        const token = jwt.sign({ id: teacher._id, email: teacher.email,department:teacher.department }, process.env.JWT_SECRET || 'secretkey', { expiresIn: '1d' });

        // Set cookie
        res.cookie('teacherToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        });

        res.status(200).json({ success: true, message: 'Login successful', teacher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getProfile = async (req, res) => {
    try {
        // req.teacher is set by authenticateTeacher middleware
        const teacher = await Teacher.findById(req.teacher.id).select('-password');
        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found.' });
        }
        res.status(200).json({ success: true, teacher });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Logout controller: clears auth cookie
exports.logoutTeacher = (req, res) => {
    res.clearCookie('teacherToken');
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
};