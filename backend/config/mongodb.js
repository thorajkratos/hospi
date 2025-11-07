
// const mongoose = require("mongoose");
// require("dotenv").config(); 

// const connectDB = async () => {
//   try {
//     // const uri = process.env.MONGODB_URI ; 
//     console.log("Connecting to MongoDB at:", process.env.MONGODB_URI); 

//     await mongoose.connect(`${process.env.MONGODB_URI}/hospi`); 
//     console.log("Database Connected"); 
//   } catch (error) {    
//     console.error("Database connection error:", error);
//     process.exit(1);
//   }
// };

// module.exports = connectDB;  




const mongoose = require("mongoose");
require("dotenv").config(); 

const connectDB = async () => {
  try {
    // Use a default URI if environment variable is not set
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital';  
     
    if (!uri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    
    console.log("Connecting to MongoDB at:", `${uri}`);   

    await mongoose.connect(uri);
    console.log("Database Connected"); 
  } catch (error) {     
    console.error("Database connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;




