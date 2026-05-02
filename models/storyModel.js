import mongoose from "mongoose";

//Define the schema
const storySchema = new mongoose.Schema({
    //Define the properties with type and required constraints
    title: {
        type: String,
        required: true,
    },

    author: {
        type: String,
        required: true,
    },

    category: {
        type: String,
        required: true,
    },

    content: {
        type: String,
    },
});

//Create and export the Mongoose model
export default mongoose.Schema("stories", storySchema);