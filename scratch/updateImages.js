import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

const storySchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    category: { type: String, required: true },
    content: { type: String },
    image: { type: String, default: "" },
});

const Story = mongoose.model("stories", storySchema);

const MONGOURL = process.env.MONGO_URL;

mongoose.connect(MONGOURL).then(async () => {
    console.log("Connected to DB");
    
    const updates = [
        { title: "The Brave Rabbit", image: "download.jpg" },
        { title: "The Clockwork Kingdom of Arlowe", image: "clockwork kingdom.jpg" },
        { title: "The Moonlit Forest", image: "moonlit.jpg" },
        { title: "The Brave Little Dragon", image: "dragon.jpg" },
        { title: "කුඩා හාවාගේ උත්සාහය", image: "rabbit.jpg" }
    ];

    for (const update of updates) {
        const result = await Story.findOneAndUpdate(
            { title: update.title },
            { $set: { image: update.image } },
            { new: true }
        );
        console.log(`Updated ${update.title}:`, result ? "Success" : "Not Found");
    }

    mongoose.disconnect();
    console.log("Disconnected from DB");
}).catch(err => {
    console.error(err);
});
