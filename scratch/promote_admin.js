import mongoose from "mongoose";
import dotenv from "dotenv";
import user from "../models/userModel.js";

dotenv.config();

const MONGOURL = process.env.MONGO_URL;
const EMAIL = "samudini@gmail.com";

mongoose.connect(MONGOURL)
    .then(async () => {
        console.log("Database connected.");
        const result = await user.findOneAndUpdate(
            { email: EMAIL },
            { role: "admin" },
            { new: true }
        );

        if (result) {
            console.log(`Success! User ${EMAIL} is now an admin.`);
            console.log(result);
        } else {
            console.log(`User ${EMAIL} not found.`);
        }
        process.exit(0);
    })
    .catch(err => {
        console.error("Error:", err);
        process.exit(1);
    });
