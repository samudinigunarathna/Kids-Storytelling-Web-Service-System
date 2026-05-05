//Import the favourite model from favouriteModel.js
import favourite from "/models/favouriteModel.js";

//For posting data into the database
export const create = async(req, res)=>{
    try{
        //Create new favourite instance with the request body
        const favouriteData = new favourite(req.body);
        const {userID, storyID} = favouriteData;
        //Check if a story with the same name already exists
        const favouriteExist = await favourite.findOne({userID, storyID});
        if(favouriteExist){
            return res.status(400).json({message: "Story already exists in favourites"})
        }
        //Save the new story data into the database and send a success response
        const saveFavourite = await favouriteData.save();
        res.status(200).json(saveFavourite);
    }
    
    catch(error){
        //Handle any errors
        res.status(500).json({error: "Internal server error."})
    }
}

//For getting all  from the database
export const fetch = async(req, res) => {
    try{
        //Find all favourites in the database
        const stories = await story.find({userID, storyID});
        //Check if stories are not available, then send a error response
        const favouriteExist = await favourite.find({userID: req.params.userID});
        if(!favouriteExist || favouriteExist.length === 0){
            return res.status(404).json({message: "No favourite stories found for this user."})
        }
        //Send a success response
        res.status(200).json(stories);
    }

    catch(error){
        //Handle any errors
        res.status(500).json({message: "Internal server error."})
    }
}

//For deleting data from the database
export const deleteFavourite = async(req, res) => {
    try{
        //Extract story id from request parameters
        const id = req.params.id;
        const favouriteExist = await story.findOne({_id:id});
        if(!favouriteExist){
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