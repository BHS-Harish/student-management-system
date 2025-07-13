import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL; 
console.log(`API Base URL: ${API_BASE_URL}`); // For debugging purposes, can be removed later
// Adjust based on your backend URL

export async function registerTeacher(teacherData) {
    let result=null;
    try {
        const response = await axios.post(`${API_BASE_URL}/teachers`, teacherData);
        result=response.data;
    } catch (error) {
        result=error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function loginTeacher(loginData) {
    let result = null;
    try {
        const response = await axios.post(`${API_BASE_URL}/teachers/login`, loginData, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function autoAuthenticate() {
    let result = null;
    try {
        const response = await axios.get(`${API_BASE_URL}/teacher`, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function getStudentsByTeacherDepartment() {
    let result = null;
    try {
        const response = await axios.get(`${API_BASE_URL}/students/by-department`, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function registerStudent(studentData) {
    let result = null;
    try {
        const response = await axios.post(`${API_BASE_URL}/students`, studentData, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function editStudent(studentId, studentData) {
    let result = null;
    try {
        const response = await axios.put(`${API_BASE_URL}/students/${studentId}`, studentData, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function logoutTeacher() {
    let result = null;
    try {
        const response = await axios.get(`${API_BASE_URL}/teachers/logout`, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function deleteStudent(studentId) {
    let result = null;
    try {
        const response = await axios.delete(`${API_BASE_URL}/students/${studentId}`, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}

export async function bulkUploadStudents(students) {
    let result = null;
    try {
        const response = await axios.post(`${API_BASE_URL}/students/bulk-upload`, { students }, { withCredentials: true });
        result = response.data;
    } catch (error) {
        result = error.response ? error.response.data : { error: 'Network error' };
    }
    return result;
}