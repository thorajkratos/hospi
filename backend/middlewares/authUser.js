

const jwt = require('jsonwebtoken');
require("dotenv").config();  



// user authentication middleware
const authUser = async (req, res, next) => {
    const { token } = req.headers; 
    console.log("Auth Token:", token); 
    // const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MGM4ZGU1YzM1NGFkOTIzZGFiNWNmNyIsImlhdCI6MTc2MjQzMTE0Mn0.ix4RqMYu9AXQLkjihQMuQZD4j5TSq-MaNpD-MDCmtdg"
    if (!token) { 
        return res.json({ success: false, message: 'Not Authorized Login Again' });
    }
    try {
        const token_decode = jwt.verify(token, process.env.JWT_SECRET);

        // ✅ Fix: Ensure req.body is defined before assigning to it
        if (!req.body) req.body = {};
 
        req.body.userId = token_decode.id; 
        console.log("Authenticated successfully");       
        next(); 
    } catch (error) { 
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

module.exports = authUser;
