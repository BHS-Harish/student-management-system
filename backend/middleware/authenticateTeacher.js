const jwt = require('jsonwebtoken');

module.exports = function authenticateTeacher(req, res, next) {
    const token = req.cookies && req.cookies.teacherToken;
    if (!token) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.teacher = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token.' });
    }
}
