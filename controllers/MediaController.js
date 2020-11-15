const media = require("../models/MediaModel");

async function avatarUpload(owner_id, mimetype, size, fileLocation){
    try{
        let mediaDocs = {
            "owner_id" : owner_id,
            "mimetype" : mimetype,
            "size" : size,
            "file_location" : fileLocation
        };
        let result = await media.create(mediaDocs); 
        if(result){
            return {"success" : true, "data" : result._id}
        }else{
            return {"success" : false};
        }
    }catch(e){
        return {"success" : false}
    }
}

module.exports.avatarUpload = avatarUpload;
//avatarUpload("123213", "image/jpeg", "234234", "/images");