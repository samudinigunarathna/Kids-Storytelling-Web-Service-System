import user from "/models/userModel.js";

export const create = async(req, res)=>{
    try{
        const userData = new user(req.body);
        const{email} = userData;
        const userExist = await user.findOne(email)
        if(userExist){
            
        }
    }

    catch(error){

    }
}