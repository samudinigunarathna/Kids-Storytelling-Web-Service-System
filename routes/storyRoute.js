import express from "express";
import { create, fetch, update, deleteStory, getById } from "../controllers/storyController.js";

const route = express.Router();

//Define routes for create, fetch, update, and delete
route.post("/create", create);
route.get("/getAllStories", fetch);
route.get("/getStoryById/:id", getById);
route.put("/update/:id", update);
route.delete("/delete/:id", deleteStory);

export default route;
