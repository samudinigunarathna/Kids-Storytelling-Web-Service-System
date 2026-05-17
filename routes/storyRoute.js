import express from "express";
import { create, fetch, update, deleteStory, getById, addReview } from "../controllers/storyController.js";
import { authMiddleware, adminMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

// Public routes
route.get("/getAllStories", fetch);
route.get("/getStoryById/:id", getById);

// Admin-only routes
route.post("/create", authMiddleware, adminMiddleware, create);
route.put("/update/:id", authMiddleware, adminMiddleware, update);
route.delete("/delete/:id", authMiddleware, adminMiddleware, deleteStory);

// Authenticated user routes
route.post("/:id/review", authMiddleware, addReview);

export default route;

