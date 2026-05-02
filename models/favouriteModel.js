import mongoose from "mongoose";

//Define the schema
const favouriteSchema = new mongoose.Schema({
    //Define the properties with type and required constraints
    userID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },

    storyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stories",
        required: true,
    },
})

//Create and export the Mongoose model
export default mongoose.Schema("favourites", favouriteSchema);