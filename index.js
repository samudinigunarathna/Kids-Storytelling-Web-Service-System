//Import necessary modules
import express from "express"; //Import Express framework
import dotenv from "dotenv"; //Import dotenv for loading environment variables
import mongoose from "mongoose"; //Import mongoose for MongoDB interactions
import bodyParser from "body-parser"; //Import Body-Parser for Parsing request

//Initialize express app
const app = express();

//Middleware for parsing .JSON request bodies
app.use(bodyParser.json());

//Load environment variables from .env file
dotenv.config();

//Define PORT for the server to listen on
const PORT = process.env.PORT || 5000;

//Define MongoDB Connection URL from environment variables
const MONGOURL = process.env.MONGO_URL;

//Connect to MONGODB database
mongoose
.connect(MONGOURL)
.then(()=>{
    console.log("Database connected successfully.");
    app.listen(PORT, ()=>{
        console.log(`Server is running on PORT ${PORT}`);
    });
})
.catch((error) => {
  console.log(error);
});