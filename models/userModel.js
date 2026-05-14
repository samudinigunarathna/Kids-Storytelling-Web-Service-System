import mongoose from "mongoose";
import bcrypt from "bcryptjs";

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
        unique: true,
    },

    password:{
        type: String,
        required: true,
    },

    childName: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        default: "user",
    }
});

// Hash password before saving
userSchema.pre("save", async function() {
    if (!this.isModified("password")) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

//Create and export the Mongoose model
export default mongoose.model("users", userSchema);