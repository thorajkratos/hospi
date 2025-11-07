
const express = require('express');
const { 
    loginDoctor, 
    appointmentsDoctor, 
    appointmentCancel, 
    doctorList, 
    appointmentComplete, 
    doctorDashboard, 
    doctorProfile, 
    updateDoctorProfile, 
    changeAvailability 
} = require('../controllers/doctorController');
const authDoctor = require('../middlewares/authDoctor');
const doctorRouter = express.Router();

doctorRouter.post("/login", loginDoctor);
doctorRouter.post("/cancel-appointment", authDoctor, appointmentCancel);
doctorRouter.get("/appointments", authDoctor, appointmentsDoctor);   
doctorRouter.get("/list", doctorList); 
doctorRouter.post("/change-availability", authDoctor, changeAvailability);
doctorRouter.post("/complete-appointment", authDoctor, appointmentComplete);
doctorRouter.get("/dashboard", authDoctor, doctorDashboard);
doctorRouter.get("/profile", authDoctor, doctorProfile);
doctorRouter.post("/update-profile", authDoctor, updateDoctorProfile);

module.exports = doctorRouter;

