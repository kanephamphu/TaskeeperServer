//const message = require("../models/MessageModel");
const users_controller = require("./UsersController");
const user = require("../models/UsersModel");



// Add new message 
async function addMessage(sender_id,receiver_id, text, image, video, audio){
    let sender_info = await users_controller.getMessagerData(sender_id);
    let result = await user.updateOne({"_id" : receiver_id}, {
        $push : {
            "message" : {
                "user" : sender_info,
                "text" : text,
                "image" : image,
                "video" : video,
                "audio" : audio
            }
        }
    });
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }   
}

// Get newest message 
async function getNewestMessage(sender_id, receiver_id){
    let newestmessage = await user.findOne({"_id" : receiver_id, "message.user._id" : sender_id},{"message" : {'$slice':-1}} );
    console.log(newestmessage.message[0]); 
}
//getNewestMessage("5f2546def9ca2b000466c467","5f2ac6648e857e00041dc2b9");
//addMessage("5f2546def9ca2b000466c467","5f2ac6648e857e00041dc2b9","Sao rồi", null, null, null);

//Read message 
async function readMessage(user_id,number_message, skip){
    let result = await user.find({
        $or : [
            {"_id" : user_id},
            {"message.user._id" : user_id}
        ]
    },"message",{limit : number_message, skip: skip});
    if(result){
        message_list = [];
        for(i in result){
            for(j in result[i].message){
                message_list.push(result[i].message[j]);
            }
        }
        return {"success" : true, "data" : message_list};
    }else{
        return {"success" : false};
    }
}

//Load message from user 
async function readUserMessage(user_id, sender_id, number_message, skip){
    let result = await user.find({
        $or : [
            {"_id" : user_id,"message.user._id" : sender_id},
            {"message.user._id" : user_id, "_id" : sender_id}
        ]
    },"message",{limit : number_message, skip: skip});
    if(result){
        message_list = [];
        for(i in result){
            for(j in result[i].message){
                message_list.push(result[i].message[j]);
            }
        }
        return {"success" : true, "data" : message_list};
    }else{
        return {"success" : false};
    }
}

//Client set readed message from specific user
async function setReaded(user_id, sender_id){
    let result = await user.update({"_id" : user_id, "message.user._id" : sender_id, "message.received" : false}, {
        "$set" : {
            "message.$.received" : true
        }
    });
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

//Client set readed all message 
async function setAllReaded(user_id){
    let result = await user.update({"_id" : user_id, "message.received" : false}, {
        "$set" : {
            "message.$.received" : true
        }
    });
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}
//setReaded("5f2546def9ca2b000466c467","5f915297b7953d1910cb033b")
//readMessage("5f2546def9ca2b000466c467",100,0);
readUserMessage("5f2546def9ca2b000466c467","5f2ac6648e857e00041dc2b9",10,0)
/*
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
                "_id" : lastmessagedata._id,
                "user" :receiver_data,
                "text" : lastmessagedata.message_text,
                "un_readed_number" : unReadNumber,
                "createdAt" : lastmessagedata.created_time 
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

//
async function getUnreadNumber(receiver_id, sender_id){
    let unread_number = await message.find({"sender_id" : sender_id, "receiver_id" : receiver_id, "is_readed" : false},{}).count();
    return unread_number;
}

// Get Total Unread Message
async function getTotalUnreadMessage(receiver_id){
    try{
        let unread_number = await message.find({"receiver_id" : receiver_id, "is_readed" : false},{}).count();
        if(unread_number){
            return {"success" : true, "data" : unread_number}
        }else{
            return {"success" : false}
        }
    }catch(e){
        throw(e);
    } 
}
//getMessagerList("5f2546def9ca2b000466c467",10,10);
//getUnreadNumber("5f2ae09e8e857e00041dc2bf","5f15dee66d224e19dcbf6bbf");
addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Heellooo", 'sdf');
//addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Nghỉ học bán hàng đa cấp với anh em ơi", 'sdf');
//addMessage("5f2ac6648e857e00041dc2b9", "5f2546def9ca2b000466c467", "text", "Được Inbox", 'sdf');
//setReaded("5f2ae09e8e857e00041dc2bf","5f15dee66d224e19dcbf6bbf");
//readMessage("5f15dee66d224e19dcbf6bbf","5f2ae09e8e857e00041dc2bf", 10,0)
module.exports.setReaded = setReaded;
module.exports.getMessagerList = getMessagerList;
module.exports.getTotalUnreadMessage = getTotalUnreadMessage;*/
module.exports.readMessage = readMessage;
module.exports.addMessage = addMessage;
module.exports.readUserMessage = readUserMessage;
module.exports.setReaded = setReaded;
module.exports.setAllReaded = setAllReaded;
module.exports.getNewestMessage = getNewestMessage;
