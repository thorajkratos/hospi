const validator = require('validator'); 
const bcrypt = require('bcrypt');
const userModel = require("../models/userModel");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const jwt = require("jsonwebtoken");
const { v2: cloudinary } = require('cloudinary');  
require("dotenv").config();  

// const Razorpay = require('razorpay'); 

// const razorpayInstance = new Razorpay({
//     key_id: process.env.RAZORPAY_KEY_ID, 
//     key_secret: process.env.RAZORPAY_KEY_SECRET
// });

// API to register user
const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body; 
        email: email.toLowerCase()

        // checking for all data to register user 
        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Missing Details" });
        }

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }


        // validating email format
        if (!validator.isEmail(email)) {  
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        // validating strong password
        if (password.length < 8) { 
            return res.status(400).json({ success: false, message: "Please enter a strong password" });
        }

        // hashing user password
        const salt = await bcrypt.genSalt(10); // the more no. round the more time it will take
        const hashedPassword = await bcrypt.hash(password, salt);

        const userData = {
            name,  
            email, 
            password: hashedPassword,
        };

        const newUser = new userModel(userData);
        const user = await newUser.save();
        // const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET, 
            { expiresIn: "7d" }
        );

 
        res.json({ success: true, token });    

    } catch (error) {
        console.log(error); 
        // res.json({ success: false, message: error.message });     
        res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });

    }
};



// API to login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }
        email: email.toLowerCase()     

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = jwt.sign( 
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "7d" }
            );

            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid credentials" });
        }
    } catch (error) { 
        console.log(error);
        res.json({ success: false, message: "Internal Server Error" }); 
    }
};



// API to get user profile data
const getProfile = async (req, res) => {
    try {
        const { userId } = req.body; 
        const userData = await userModel.findById(userId).select('-password');

        res.json({ success: true, userData });   
 
    } catch (error) {
        console.log(error);  
        res.json({ success: false, message: error.message });
    }
};




const updateProfile = async (req, res) => {
    try {
        const { userId, name, phone, address, dob, gender } = req.body;
        const imageFile = req.file;

        // Make address optional in validation
        if (!name || !phone || !dob || !gender) { 
            return res.json({ success: false, message: "Required fields missing" });
        }

        console.log("going to update profile"); 

        // Prepare update data
        const updateData = { name, phone, dob, gender };

        // Only add address if provided and not empty
        if (address && address.trim() !== '') {
            try {
                updateData.address = JSON.parse(address); 
            } catch (parseError) {
                // If JSON parsing fails, treat it as a string
                updateData.address = address;
            }
        }

        await userModel.findByIdAndUpdate(userId, updateData);

        if (imageFile) { 
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            const imageURL = imageUpload.secure_url;  
            await userModel.findByIdAndUpdate(userId, { image: imageURL });
        }

        res.json({ success: true, message: 'Profile Updated', updateData }); 

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};


// API to book appointment 
const bookAppointment = async (req, res) => {
    try {
        const { userId, docId, slotDate, slotTime } = req.body; 
        if (!docId || !slotDate || !slotTime) {
            return res.status(400).json({
            success: false, 
            message: "Missing appointment details"
        });
}

        const docData = await doctorModel.findById(docId).select("-password");
        if (!docData) {
            return res.status(404).json({
                success: false,
                message: "Doctor not found"
            });
        }



        if (!docData.available) {
            return res.json({ success: false, message: 'Doctor Not Available' });
        }

        let slots_booked = docData.slots_booked;

        // checking for slot availability 
        if (slots_booked[slotDate]) {
            if (slots_booked[slotDate].includes(slotTime)) {
                return res.json({ success: false, message: 'Slot Not Available' });
            } else {   
                slots_booked[slotDate].push(slotTime);
            }
        } else {
            slots_booked[slotDate] = [];
            slots_booked[slotDate].push(slotTime);
        }

        const userData = await userModel.findById(userId).select("-password");

        delete docData.slots_booked;

        const appointmentData = {
            userId,
            docId,
            userData,
            docData,
            amount: docData.fees,
            slotTime,
            slotDate,
            date: Date.now()
        };

        const newAppointment = new appointmentModel(appointmentData);
        await newAppointment.save();

        // save new slots data in docData
        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Booked' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to cancel appointment
const cancelAppointment = async (req, res) => {
    try {
        const { userId, appointmentId } = req.body;
        
        const appointmentData = await appointmentModel.findById(appointmentId);
        if (!appointmentData) {
            return res.status(404).json({
                success: false,
                message: "Appointment not found"
            });
        }


        // verify appointment user 
        if (appointmentData.userId !== userId) {
            return res.json({ success: false, message: 'Unauthorized action' });
        }
        
        if (appointmentData.cancelled) {
            return res.status(400).json({
                success: false,
                message: "Appointment already cancelled"
            });
        }

        await appointmentModel.findByIdAndUpdate(appointmentId, { cancelled: true });

        // releasing doctor slot 
        const { docId, slotDate, slotTime } = appointmentData;

        const doctorData = await doctorModel.findById(docId);

        let slots_booked = doctorData.slots_booked;

        slots_booked[slotDate] = slots_booked[slotDate].filter(e => e !== slotTime);

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });

        res.json({ success: true, message: 'Appointment Cancelled' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to get user appointments for frontend my-appointments page
const listAppointment = async (req, res) => {
    try {
        const { userId } = req.body;
        const appointments = await appointmentModel.find({ userId });

        res.json({ success: true, appointments });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to make payment of appointment using razorpay
const paymentRazorpay = async (req, res) => {
    try {
        const { appointmentId } = req.body;
        const appointmentData = await appointmentModel.findById(appointmentId);

        if (!appointmentData || appointmentData.cancelled) {
            return res.json({ success: false, message: 'Appointment Cancelled or not found' });
        }

        // creating options for razorpay payment
        const options = {
            amount: appointmentData.amount * 100,
            currency: process.env.CURRENCY,
            receipt: appointmentId,
        };

        // creation of an order
        const order = await razorpayInstance.orders.create(options);

        res.json({ success: true, order });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// API to verify payment of razorpay
const verifyRazorpay = async (req, res) => {
    try {
        const { razorpay_order_id } = req.body;
        const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);

        if (orderInfo.status === 'paid') {
            await appointmentModel.findByIdAndUpdate(orderInfo.receipt, { payment: true });
            res.json({ success: true, message: "Payment Successful" });
        } else {
            res.json({ success: false, message: 'Payment Failed' });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

module.exports = {
    registerUser, 
    loginUser, 
    getProfile, 
    updateProfile, 
    bookAppointment, 
    listAppointment, 
    cancelAppointment, 
    paymentRazorpay, 
    verifyRazorpay
};