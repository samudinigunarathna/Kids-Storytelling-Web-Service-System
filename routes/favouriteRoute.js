import express from "express";
import { create, fetch, deleteFavourite } from "../controllers/favouriteController.js";

const route = express.Router();

//Define routes for create, fetch, and delete
route.post("/create", create);
route.get("/getFavourites/:userID", fetch);
route.delete("/delete/:id", deleteFavourite);

export default route;
