import express from "express";
import { createQuiz, getQuizByStory, submitQuiz, deleteQuiz, updateQuiz, getAllQuizzes } from "../controllers/quizController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

// Public/User routes
route.get("/getQuiz/:storyID", authMiddleware, getQuizByStory);
route.post("/submit", authMiddleware, submitQuiz);

// Admin routes
route.get("/getAllQuizzes", authMiddleware, adminMiddleware, getAllQuizzes);
route.post("/create", authMiddleware, adminMiddleware, createQuiz);
route.put("/update/:id", authMiddleware, adminMiddleware, updateQuiz);
route.delete("/delete/:id", authMiddleware, adminMiddleware, deleteQuiz);

export default route;
