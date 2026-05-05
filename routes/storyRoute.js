import express from "express";
import { create, fetch, update, deleteStory } from "../controllers/storyController.js";

const route = express.Router();

//Define routes for create, fetch, update, and delete
route.post("/create", create);
route.get("/getAllStories", fetch);
route.put("/update/:id", update);
route.delete("/delete/:id", deleteStory);

export default route;
