//Import necessary modules
import express from "express"; //Import Express framework
import dotenv from "dotenv"; //Import dotenv for loading environment variables
dotenv.config();
import mongoose from "mongoose"; //Import mongoose for MongoDB interactions
import bodyParser from "body-parser"; //Import Body-Parser for Parsing request

import userRoute from "./routes/userRoute.js";
import storyRoute from "./routes/storyRoute.js";
import favouriteRoute from "./routes/favouriteRoute.js";


//Initialize express app
const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

//Middleware for parsing .JSON request bodies
app.use(bodyParser.json());

//Test route
app.get("/ping", (req, res) => res.send("pong"));
app.get("/favicon.ico", (req, res) => res.status(204).end());

//Serve static files from public directory
app.use(express.static("public"));

//CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

//Define PORT for the server to listen on
const PORT = process.env.PORT || 5000;

//Define MongoDB Connection URL from environment variables
const MONGOURL = process.env.MONGO_URL;

//Connect to MONGODB database
mongoose
  .connect(MONGOURL)
.then(() => {
    console.log("Database connected successfully.");
    console.log("Connected to database:", mongoose.connection.name);
    app.listen(PORT, () => {
      console.log(`Server is running on PORT ${PORT}`);
    });
  });

app.use("/api/user", userRoute);
app.use("/api/story", storyRoute);
app.use("/api/favourite", favouriteRoute);
