// import mongoose from "mongoose";

// export const connectDB = async () => {
//     await mongoose.connect("mongodb://localhost:27017/foodapp",{
//         useNewUrlParser : true,
//         useUnifiedTopology : true,
//     })
//     .then(()=>console.log("DB Connected"));
    
// }
//5YJMv0ahXBy3kzMK
// //mongodb+srv://eng23mca117:5YJMv0ahXBy3kzMK@authapp.mkdku.mongodb.net/foodapp


import mongoose from "mongoose"; 
import dotenv from "dotenv";

dotenv.config();

export const connectDB = () => {
    // It fetches data from .env file, ensure dotenv is installed with npm i dotenv
    mongoose.connect(process.env.DATABASE_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection is successful"))
    .catch((error) => {
        console.log("Issue in DB connection");
        console.log(error.message);
        process.exit(1);
    });
};

