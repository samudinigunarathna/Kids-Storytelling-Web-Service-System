import quiz from "../models/quizModel.js";
import story from "../models/storyModel.js";

// Create a quiz for a story (Admin only)
export const createQuiz = async (req, res) => {
    try {
        const { storyID, questions } = req.body;

        // Check if story exists
        const storyExist = await story.findById(storyID);
        if (!storyExist) {
            return res.status(404).json({ message: "Story not found" });
        }

        // Check if quiz already exists for this story
        const quizExist = await quiz.findOne({ storyID });
        if (quizExist) {
            return res.status(400).json({ message: "Quiz already exists for this story. Use update instead." });
        }

        const newQuiz = new quiz({ storyID, questions });
        const savedQuiz = await newQuiz.save();
        res.status(201).json({ 
            message: "Quiz created successfully", 
            quiz: savedQuiz 
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Fetch quiz by story ID
export const getQuizByStory = async (req, res) => {
    try {
        const { storyID } = req.params;
        const quizData = await quiz.findOne({ storyID });

        if (!quizData) {
            return res.status(404).json({ message: "No quiz found for this story" });
        }

        res.status(200).json(quizData);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Validate quiz answers and return score
export const submitQuiz = async (req, res) => {
    try {
        const { quizID, answers } = req.body; // answers: [ { questionID, selectedIndex }, ... ]

        const quizData = await quiz.findById(quizID);
        if (!quizData) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        let score = 0;
        const totalQuestions = quizData.questions.length;
        const results = quizData.questions.map((q, index) => {
            const userAnswer = answers.find(a => a.questionID === q._id.toString());
            const isCorrect = userAnswer && userAnswer.selectedIndex === q.correctOptionIndex;
            if (isCorrect) score++;

            return {
                questionID: q._id,
                correct: isCorrect,
                correctIndex: q.correctOptionIndex
            };
        });

        res.status(200).json({
            score,
            totalQuestions,
            percentage: (score / totalQuestions) * 100,
            results
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedQuiz = await quiz.findByIdAndDelete(id);
        if (!deletedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json({ message: "Quiz deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
    try {
        const id = req.params.id;
        const { questions } = req.body;
        
        const updatedQuiz = await quiz.findByIdAndUpdate(
            id, 
            { questions }, 
            { new: true }
        );
        
        if (!updatedQuiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }
        res.status(200).json({
            message: "Quiz updated successfully",
            quiz: updatedQuiz
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};

// Get all quizzes (Admin)
export const getAllQuizzes = async (req, res) => {
    try {
        const quizzes = await quiz.find().populate("storyID", "title");
        res.status(200).json(quizzes);
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
};
