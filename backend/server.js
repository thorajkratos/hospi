

const express = require("express"); 
require("dotenv").config();  
const connectDB = require("./config/mongodb.js");
const cors = require('cors'); 
//  const connectCloudinary = require('./config/cloudinary.js') 
const adminRouter = require("./routes/adminRoute.js");
const doctorRouter = require("./routes/doctorRoute.js"); 
const userRouter = require("./routes/userRoute.js");


// app config
const app = express();
const port = process.env.PORT || 4000;  

// Connect to database (CALL THE FUNCTION)
connectDB(); 
//  connectCloudinary()

// middlewares
app.use(express.json());  
app.use(cors());

// api endpoints
app.use("/api/admin", adminRouter);
app.use("/api/doctor", doctorRouter); 
app.use("/api/user", userRouter); 

app.get("/", (req, res) => {
  res.send("API is  Working now properly");
}); 

app.get("/test-db", (req, res) => { 
  const state = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (state === 1) {
    res.send("Database is connected");
  } else {
    res.status(500).send("Database is NOT connected");
  }
});

app.listen(port, () => console.log(`Server started on PORT:${port}`));