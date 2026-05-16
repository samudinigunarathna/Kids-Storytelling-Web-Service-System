import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: [{
        type: String,
        required: true
    }],
    correctOptionIndex: {
        type: Number,
        required: true
    }
});

const quizSchema = new mongoose.Schema({
    storyID: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "stories",
        required: true,
        unique: true // One quiz per story
    },
    questions: [questionSchema]
}, { timestamps: true });

export default mongoose.model("quizzes", quizSchema);
