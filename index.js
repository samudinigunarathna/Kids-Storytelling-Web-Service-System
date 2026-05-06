//Import necessary modules
import express from "express"; //Import Express framework
import dotenv from "dotenv"; //Import dotenv for loading environment variables
import mongoose from "mongoose"; //Import mongoose for MongoDB interactions
import bodyParser from "body-parser"; //Import Body-Parser for Parsing request

import userRoute from "./routes/userRoute.js";
import storyRoute from "./routes/storyRoute.js";
import favouriteRoute from "./routes/favouriteRoute.js";


//Initialize express app
const app = express();

//Middleware for parsing .JSON request bodies
app.use(bodyParser.json());

//Serve static files from public directory
app.use(express.static("public"));

//CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//Load environment variables from .env file
dotenv.config();

//Define PORT for the server to listen on
const PORT = process.env.PORT || 5000;

//Define MongoDB Connection URL from environment variables
const MONGOURL = process.env.MONGO_URL;

//Connect to MONGODB database
mongoose
  .connect(MONGOURL)
  .then(() => {
    console.log("Database connected successfully.");
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  });

app.use("/api/user", userRoute);
app.use("/api/story", storyRoute);
app.use("/api/favourite", favouriteRoute);
