
const express = require('express');
const router = express.Router();
const StudentController = require('../controllers/StudentController');
const TeacherAuthenticate = require('../middleware/authenticateTeacher');


// Apply TeacherAuthenticate middleware to all student routes
router.use(TeacherAuthenticate);

// Create a new student
router.post('/students', StudentController.createStudent);

// Bulk upload students
router.post('/students/bulk-upload', StudentController.bulkUploadStudents);

// Get students by teacher's department
router.get('/students/by-department', StudentController.getStudentsByTeacherDepartment);

// Get single student by ID
router.get('/students/:id', StudentController.getStudentById);

// Edit student by ID           
router.put('/students/:id', StudentController.editStudentById);

// Delete student by ID 
router.delete('/students/:id', StudentController.deleteStudentById);


module.exports = router;
