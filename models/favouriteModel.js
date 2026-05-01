import mongoose from "mongoose";

const favouriteSchema = new mongoose.Schema({
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

export default mongoose.Schema("favourites", favouriteSchema);