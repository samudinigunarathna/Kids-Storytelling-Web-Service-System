//Import the user model from UserModel.js
import user from "../models/userModel.js";
import jwt from "jsonwebtoken";

//For posting data into the database
export const create = async (req, res) => {
    try {
        console.log("Create user request received:", req.body);
        //Create new user instance with the request body
        const userData = new user(req.body);
        const { email } = userData;
        //Check if a user with the same email already exists
        const userExist = await user.findOne({ email })
        if (userExist) {
            console.log("User already exists:", email);
            return res.status(400).json({ message: "User already exists" })
        }
        //Save the new user data into the database
        const saveUser = await userData.save();
        console.log("User saved successfully:", saveUser.email);

        // Return user data without password
        const userResponse = saveUser.toObject();
        delete userResponse.password;

        // Generate token for automatic login after registration
        const token = jwt.sign(
            { id: userResponse._id, email: userResponse.email, role: userResponse.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        res.status(200).json({ user: userResponse, token });
    }

    catch (error) {
        console.error("Error saving user:", error);
        //Handle any errors
        res.status(500).json({ error: "Internal server error." })
    }
}

//For getting all users from the database
export const fetch = async (req, res) => {
    try {
        //Find all users in the database
        const users = await user.find().select("-password");
        //Check if users are not available, then send a error response
        if (users.length === 0) {
            return res.status(404).json({ message: "Users not found." })
        }
        //Send a success response
        res.status(200).json(users);
    }

    catch (error) {
        //Handle any errors
        res.status(500).json({ message: "Internal server error." })
    }
}

export const update = async (req, res) => {
    try {
        //Extract user id from request parameters
        const id = req.params.id;
        //Check if the user with the give id exists
        const userExist = await user.findOne({ _id: id });
        if (!userExist) {
            return res.status(404).json({ message: "User not exists" })
        }

        // If password is being updated, it will be hashed by pre-save hook IF we use save()
        // But findByIdAndUpdate bypasses middleware. 
        // For simplicity here, if password exists in req.body, we should handle it or just use save()

        const updateUser = await user.findByIdAndUpdate(id, req.body, { new: true }).select("-password");
        res.status(201).json(updateUser);
    }

    catch (error) {
        //Handle any errors
        res.status(500).json({ message: "Internal server error." })
    }
}

//For deleting data from the database
export const deleteUser = async (req, res) => {
    try {
        //Extract user id from request parameters
        const id = req.params.id;
        //Check if the user with the give id exists
        const userExist = await user.findOne({ _id: id });
        if (!userExist) {
            return res.status(404).json({ Message: "User not exists" })
        }
        //Delete the user from the database
        await user.findByIdAndDelete(id);
        //Send a success response
        res.status(201).json({ Message: "User deleted succesfully." });
    }

    catch (error) {
        res.status(500).json({ message: "Internal server error." })
    }
}

//For user login
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const userExist = await user.findOne({ email });
        if (!userExist) {
            return res.status(404).json({ message: "User not found" });
        }
        
        // Use the method we added to the model
        const isMatch = await userExist.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        // Verify JWT_SECRET is available
        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing in environment variables");
            return res.status(500).json({ message: "Configuration error: JWT_SECRET is missing." });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: userExist._id, email: userExist.email, role: userExist.role },
            process.env.JWT_SECRET,
            { expiresIn: "24h" }
        );

        // Remove password from response
        const userResponse = userExist.toObject();
        delete userResponse.password;

        res.status(200).json({ 
            message: "Login successful", 
            token, 
            user: userResponse 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: error.message || "Internal server error." });
    }
}
