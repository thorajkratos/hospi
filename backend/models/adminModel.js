

const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true  },
    password: { type: String, required: true },
    role: {type: String,enum: ["user", "doctor", "admin"],default: "user"}


});

const adminModel = mongoose.models.admin || mongoose.model("admin", adminSchema);

module.exports = adminModel;


