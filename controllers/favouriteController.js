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

