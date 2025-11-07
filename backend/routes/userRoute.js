
const express = require('express');
const { 
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment,  
    listAppointment, 
    cancelAppointment, 
    // paymentRazorpay, 
    // verifyRazorpay 
} = require('../controllers/userController');
const authUser = require('../middlewares/authUser');
const upload = require('../middlewares/multer');

const userRouter = express.Router(); 

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser); 
userRouter.get("/get-profile", authUser, getProfile);  
userRouter.post("/update-profile", upload.single('image'), authUser, updateProfile);
userRouter.post("/book-appointment", authUser, bookAppointment); 
userRouter.get("/appointments", authUser, listAppointment); 
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
// userRouter.post("/payment-razorpay", authUser, paymentRazorpay);
// userRouter.post("/verifyRazorpay", authUser, verifyRazorpay);

module.exports = userRouter;

