const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const connectDB=require('./config/db')

dotenv.config();

connectDB()

// Create Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:3000', // Adjust to your frontend URL
  credentials: true
}));
app.use(helmet()); 
app.use(express.json()); 
app.use(cookieParser()); 

const teacherRoutes = require('./routes/teacher');
const studentRoutes = require('./routes/student');
// Teacher routes
app.use('/api', teacherRoutes);
app.use('/api', studentRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
