const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, },  
    image: { type: String, default: ''},  
    role: {type: String,enum: ["user", "doctor", "admin"],default: "user"},
    phone: { type: String, default: '000000000' },
    address: { type: Object, default: { line1: '', line2: '' } },
    gender: { type: String, default: 'Not Selected' },   
    dob: { type: Date, default: 'Not Selected' },
    password: { type: String, required: true },
});



const userModel = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = userModel;