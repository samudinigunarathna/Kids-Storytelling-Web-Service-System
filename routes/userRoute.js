import express from "express";
import { create, fetch, update, deleteUser } from "../controllers/userController.js";

const route = express.Router();

//Define routes for create, fetch, update, and delete
route.post("/create", create);
route.get("/getAllUsers", fetch);
route.put("/update/:id", update);
route.delete("/delete/:id", deleteUser);

export default route;
