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

    image: {
        type: String,
        default: "",
    },

    reviews: [{
        userID: { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true },
        userName: { type: String, required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        reviewText: { type: String, required: false },
        createdAt: { type: Date, default: Date.now }
    }],

    averageRating: {
        type: Number,
        default: 0
    }
});

//Create and export the Mongoose model
export default mongoose.model("stories", storySchema);