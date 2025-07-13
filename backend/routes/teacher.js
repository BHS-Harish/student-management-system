const express = require('express');
const router = express.Router();
const TeacherController = require('../controllers/TeacherController');
const authenticateTeacher = require('../middleware/authenticateTeacher');

// Create a new teacher
router.post('/teachers', TeacherController.createTeacher);
router.post('/teachers/login', TeacherController.loginTeacher);
router.get('/teacher',authenticateTeacher,TeacherController.getProfile);
router.get('/teachers/logout', authenticateTeacher, TeacherController.logoutTeacher);

module.exports = router;
