import express from "express";
import { create, fetch, deleteFavourite, removeByStoryID } from "../controllers/favouriteController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const route = express.Router();

// All favourite routes require authentication
route.use(authMiddleware);

route.post("/create", create);
route.get("/getFavourites/:userID", fetch);
route.delete("/delete/:id", deleteFavourite);
route.delete("/remove/:userID/:storyID", removeByStoryID);

export default route;

