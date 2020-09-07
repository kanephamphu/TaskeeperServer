const message = require("../models/MessageModel");

//Add new message 
async function addMessage(sender_id, receiver_id, message_type, message_text, message_link){
    if(message_type == "text"){
        let result = await message.create({
            "sender_id" : sender_id,
            "receiver_id" : receiver_id,
            "message_type" : message_type,
            "message_text" : message_text
        });
        if(result){
            return {"success" : true}
        }else{
            return {"success" : false}
        }   
    }else{
        let result = await message.create({
            "sender_id" : sender_id,
            "receiver_id" : receiver_id,
            "message_type" : message_type,
            "message_link" : message_link
        });
        if(result){
            return {"success" : true}
        }else{
            return {"success" : false}
        }
    }
}

//Read message 
async function readMessage(sender_id, receiver_id, number_message, skip){
    let result = await message.find({
        $or :{
            "sender_id" : sender_id,
            "receiver_id" : receiver_id,
            "sender_id" : receiver_id,
            "receiver_id" : sender_id
        }
    }, {limit : number_message, skip: skip}).sort({'created_time' : -1});
    if(result){
        return {"success" : true, "data" : result};
    }else{
        return {"success" : false};
    }
}

//Set readed
async function setReaded(sender_id, receiver_id){
    let result = await message.updateMany({
        "sender_id" : sender_id,
        "receiver_id" : receiver_id
    }, {"is_readed" : true});
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}


//addMessage("5f2ae09e8e857e00041dc2bf", "5f15dee66d224e19dcbf6bbf", "text", "Hi there", 'sdf');
//setReaded("5f2ae09e8e857e00041dc2bf","5f15dee66d224e19dcbf6bbf");
module.exports.readMessage = readMessage;
module.exports.addMessage = addMessage;
