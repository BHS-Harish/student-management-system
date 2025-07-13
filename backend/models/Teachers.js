const mongoose = require('mongoose');

const TeacherSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password:{type:String,required:true},
  department: { type: String },
});

module.exports = mongoose.model('Teacher', TeacherSchema);
