const notification = require('../models/NotificationModel');

// Add new notification 
async function addNotification(user_id, description, type ,task_id, related_user_id){
    let result = await notification.create({
        "user_id" : user_id,
        "description" :description,
        "type" : type,
        "task_id" : task_id,
        "related_user_id" : related_user_id
    })
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }
};
//addNotification("5f2546def9ca2b000466c467", "Đã follow bạn", null, "5f59fd269a3b8500045c8375")

// Get notifications
async function getNotification(user_id, number_notification, skip){
    let result = await notification.find({
        "user_id" : user_id},{}, {limit : number_notification, skip: skip});
    console.log(result)
        if(result){
        return {"success" : true, "data" : result};
    }else{
        return {"success" : false};
    }
}

// Set readed notifications
async function setReaded(user_id, notification_id){
    let result = await notification.updateOne({"user_id" : user_id, "_id" : notification_id}, {"is_readed" : true});
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }
}

// Set notification readed
async function setReadedAll(user_id){
    let result = await notification.update({"user_id" : user_id, "is_readed" : false}, {"is_readed" : true});
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }
}

// Get unread notification 
async function getTotalUnreadNotification(user_id){
    try{
        let unread_number = await notification.find({"_id" : user_id, "is_readed" : false},{}).count();
        if(unread_number){
            return {"success" : true, "data" : unread_number}
        }else{
            return {"success" : false}
        }
    }catch(e){
        throw(e);
    }
}
//getTotalUnreadNotification("5f2546def9ca2b000466c467");
//getNotification("5f2546def9ca2b000466c467",1,0)
module.exports.getNotification = getNotification;
module.exports.setReaded = setReaded;
module.exports.setReadedAll = setReadedAll;
module.exports.addNotification = addNotification;
module.exports.getTotalUnreadNotification = getTotalUnreadNotification;