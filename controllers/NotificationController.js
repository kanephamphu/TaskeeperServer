const notification = require('../models/NotificationModel');

// Add new notification 
async function addNotification(user_id, description, task_id){
    let result = await notification.create({
        "user_id" : user_id,
        "description" :description,
        "task_id" : task_id
    })
    if(result){
        return {"success" : true}
    }else{
        return {"success" : false}
    }
};

// Get notifications
async function getNotification(user_id, number_notification, skip){
    let result = await notification.find({
        "user_id" : user_id}, {limit : number_notification, skip: skip});
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

module.exports.getNotification = getNotification;
module.exports.setReaded = setReaded;
module.exports.setReadedAll = setReadedAll;
module.exports.addNotification = addNotification;