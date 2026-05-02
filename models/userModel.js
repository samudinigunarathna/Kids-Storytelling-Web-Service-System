import mongoose from "mongoose";

//Define the schema
const userSchema = new mongoose.Schema({
    //Define the properties with type and required constraints
    name:{
        type: String,
        required: true,
    },

    email:{
        type: String,
        required: true,
    },

    password:{
        type: String,
        required: true,
    },

    childName: {
        type: String,
        required: true,
    }
});

//Create and export the Mongoose model
export default mongoose.model("users", userSchema);