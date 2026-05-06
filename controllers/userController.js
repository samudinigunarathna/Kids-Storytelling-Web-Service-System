//Import the user model from UserModel.js
import user from "../models/userModel.js";

//For posting data into the database
export const create = async (req, res) => {
    try {
        //Create new user instance with the request body
        const userData = new user(req.body);
        const { email } = userData;
        //Check if a user with the same email already exists
        const userExist = await user.findOne({ email })
        if (userExist) {
            return res.status(400).json({ message: "User already exists" })
        }
        //Save the new user data into the database and send a success response
        const saveUser = await userData.save();
        res.status(200).json(saveUser);
    }

    catch (error) {
        //Handle any errors
        res.status(500).json({ error: "Internal server error." })
    }
}

//For getting all users from the database
export const fetch = async (req, res) => {
    try {
        //Find all users in the database
        const users = await user.find();
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
        //Update the user data and return the updated user
        const updateUser = await user.findByIdAndUpdate(id, req.body, { new: true });
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
        //Handle any errors
        res.status(500).json({ message: "Internal server error." })
    }
}