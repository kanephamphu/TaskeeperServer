const message = require("../models/MessageModel");
const user = require("./UsersController");
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
        $or : [
            {
            "sender_id" : sender_id,
            "receiver_id" : receiver_id
            },
            {
                "sender_id" : receiver_id,
                "receiver_id" : sender_id
            }
        ]},{}, {limit : number_message, skip: skip}).sort({'created_time' : -1});
    console.log(result);
    if(result){
        return {"success" : true, "data" : result};
    }else{
        return {"success" : false};
    }
}

// Set readed
async function setReaded(sender_id, receiver_id){
    let result = await message.updateMany({
        "sender_id" : sender_id,
        "receiver_id" : receiver_id,
        "is_readed" : false
    }, {"is_readed" : true});
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

// Get messager list
async function getMessagerList(user_id, number_messager, skip){
    let result = await message.aggregate([{$match : {"receiver_id" : user_id}},
    {$group : {_id : { sender_id:"$sender_id"}}}, 
    {$sort : {created_time : -1}}
    ]);
    if(result){
        let data = [];
        for(let index in result){
            let receiver_data = await user.getMessagerData(result[index]._id.sender_id); 
            let lastmessagedata = await getLastMessageData(user_id, result[index]._id.sender_id);
            let unReadNumber = await getUnreadNumber(user_id, result[index]._id.sender_id);
            data.push({
                "receiver_data" :receiver_data,
                "last_message_data" : lastmessagedata,
                "un_readed_number" : unReadNumber
            });
        }
        return {"success" : true, "data" : data};
    }
    return {"success" : false};
}
async function getLastMessageData(receiver_id, sender_id){
    let result = await message.findOne({"sender_id" : sender_id, "receiver_id" : receiver_id}, 
    ["message_text","created_time"], {limit : 1}).sort({"created_time":-1});
    return result;
}

async function getUnreadNumber(receiver_id, sender_id){
    let unread_number = await message.find({"sender_id" : sender_id, "receiver_id" : receiver_id, "is_readed" : false},{}).count();
    return unread_number;
}
//getMessagerList("5f2546def9ca2b000466c467",10,10);
//getUnreadNumber("5f2ae09e8e857e00041dc2bf","5f15dee66d224e19dcbf6bbf");
//addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Heellooo", 'sdf');
//addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Nghỉ học bán hàng đa cấp với anh em ơi", 'sdf');
//addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Được Inbox", 'sdf');
//setReaded("5f2ae09e8e857e00041dc2bf","5f15dee66d224e19dcbf6bbf");
module.exports.readMessage = readMessage;
module.exports.addMessage = addMessage;
module.exports.setReaded = setReaded;
module.exports.getMessagerList = getMessagerList;
