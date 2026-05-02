//Import the story model from storyModel.js
import story from "/models/storyModel.js";

//For posting data into the database
export const create = async(req, res)=>{
    try{
        //Create new user instance with the request body
        const storyData = new story(req.body);
        const {title} = storyData;
        //Check if a story with the same name already exists
        const storyExist = await story.findOne(title);
        if(storyExist){
            return res.status(400).json({message: "Story already exists"})
        }
        //Save the new story data into the database and send a success response
        const saveStory = await storyData.save();
        res.status(200).json(saveStory);
    }
    
    catch(error){
        //Handle any errors
        res.status(500).json({error: "Internal server error."})
    }
}

//For getting all stories from the database
export const fetch = async(req, res)=>{
    try{
        //Find all stories in the database
        const stories = await story.find();
        //Check if stories are not available, then send a error response
        if(stories.length === 0){
            return res.status(404).json({message: "Stories not found."})
        }
        //Send a success response
        res.status(200).json(stories);
    }

    catch(error){
        //Handle any errors
        res.status(500).json({message: "Internal server error."})
    }
}

export const update = async(req, res)=>{
    try{
        //Extract story id from request parameters
        const id = req.params.id;
        //Check if the story with the give id exists
        const storyExist = await user.findOne({_id:id});
        if(!storyExist){
            return res.status(404).json({message: "Story not exists"})
        }
        //Update the story data and return the updated story
        const updateStory = await story.findByIdAndUpdate(id, req.body, {new:true});
        res.status(201).json(updateStory);
    }

    catch(error){
        //Handle any errors
        res.status(500).json({message: "Internal server error."})
    }
}

//For deleting data from the database
export const deleteStory = async(req, res)=>{
    try{
       //Extract story id from request parameters
       const id = req.params.id;
       //Check if the story with the give id exists
       const storyExist = await story.findOne({_id:id});
       if(!storyExist){
        return res.status(404).json({Message: "Story not exists"})
       } 
       //Delete the story from the database
       await story.findByIdAndDelete(id);
       //Send a success response
       res.status(201).json({Message: "Story deleted succesfully."});
    }

    catch(error){
        //Handle any errors
        res.status(500).json({message: "Internal server error."})
    }
}