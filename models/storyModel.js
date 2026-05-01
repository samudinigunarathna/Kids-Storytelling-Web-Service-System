import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
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

export default mongoose.Schema("stories", storySchema);