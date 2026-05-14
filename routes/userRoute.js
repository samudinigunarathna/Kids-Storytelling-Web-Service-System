import express from "express";
import { create, fetch, update, deleteUser, login } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

//Define routes for create, fetch, update, and delete
route.post("/create", create);
route.post("/login", login);

// Protected routes
route.get("/getAllUsers", authMiddleware, fetch);
route.put("/update/:id", authMiddleware, update);
route.delete("/delete/:id", authMiddleware, deleteUser);

export default route;

