const Student = require('../models/Students');

exports.createStudent = async (req, res) => {
    try {
        const { name, age, email } = req.body;
        const teacher = req.teacher; // Set by TeacherAuthenticate middleware

        // Validations
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({ error: 'Name is required and must be a non-empty string.' });
        }
        if (!age || typeof age !== 'number' || age < 1) {
            return res.status(400).json({ error: 'Age is required and must be a positive number.' });
        }
        if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
            return res.status(400).json({ error: 'A valid email is required.' });
        }

        // Check if email already exists
        const existingStudent = await Student.findOne({ email });
        if (existingStudent) {
            return res.status(400).json({ error: 'Email is already registered.' });
        }

        const student = new Student({ name, age, email, department:teacher.department});
        await student.save();
        res.status(201).json({ success: true, message: 'Student created successfully', student });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.bulkUploadStudents = async (req, res) => {
    try {
        const students = req.body.students;
        const {department} = req.teacher; // Get department from authenticated teacher
        if (!Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ error: 'Students must be a non-empty array.' });
        }

        const results = [];
        for (const data of students) {
            const { name, age, email } = data;
            // Validate
            if (!name || typeof name !== 'string' || name.trim().length === 0) {
                results.push({ email, success: false, error: 'Name is required and must be a non-empty string.' });
                continue;
            }
            if (!age || Number(age) < 1) {
                results.push({ email, success: false, error: 'Age is required and must be a positive number.' });
                continue;
            }
            if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email)) {
                results.push({ email, success: false, error: 'A valid email is required.' });
                continue;
            }
            // Check for duplicate email
            const existingStudent = await Student.findOne({ email });
            if (existingStudent) {
                results.push({ email, success: false, error: 'Email is already registered.' });
                continue;
            }
            // Save student
            try {
                const student = new Student({ name, age, email, department });
                await student.save();
                results.push({ email, student });
            } catch (err) {
                results.push({ email, success: false, error: err.message });
            }
        }
        res.status(200).json({ results });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }
        res.status(200).json({ success: true, student });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getStudentsByTeacherDepartment = async (req, res) => {
    try {
        // req.teacher is set by TeacherAuthenticate middleware
        const teacherDepartment = req.teacher.department;
        if (!teacherDepartment) {
            return res.status(400).json({ error: 'Teacher department not found in authentication.' });
        }
        const students = await Student.find({ department: teacherDepartment });
        res.status(200).json({ success: true, students });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.editStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { name, age, email } = req.body;
        const teacher = req.teacher;

        // Validations
        if (name && (typeof name !== 'string' || name.trim().length === 0)) {
            return res.status(400).json({ error: 'Name must be a non-empty string.' });
        }
        if (age && (typeof age !== 'number' || age < 1)) {
            return res.status(400).json({ error: 'Age must be a positive number.' });
        }
        if (email && (typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email))) {
            return res.status(400).json({ error: 'A valid email is required.' });
        }

        // Find student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Only allow editing students in teacher's department
        if (student.department !== teacher.department) {
            return res.status(403).json({ error: 'You can only edit students in your department.' });
        }

        // Update fields
        if (name) student.name = name;
        if (age) student.age = age;
        if (email) student.email = email;

        await student.save();
        res.status(200).json({ success: true, message: 'Student updated successfully', student });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.deleteStudentById = async (req, res) => {
    try {
        const studentId = req.params.id;
        const teacher = req.teacher;

        // Find student
        const student = await Student.findById(studentId);
        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        // Only allow deleting students in teacher's department
        if (student.department !== teacher.department) {
            return res.status(403).json({ error: 'You can only delete students in your department.' });
        }

        await student.deleteOne();
        res.status(200).json({ success: true, message: 'Student deleted successfully.' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};