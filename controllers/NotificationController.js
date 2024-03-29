const notification = require("../models/NotificationModel");
const userController = require("../controllers/UsersController");
// Add new notification
async function addNotification(
  user_id,
  description,
  type,
  task_id,
  related_user_id
) {
  let user = await userController.getInformation(related_user_id);
  let result = await notification.create({
    user_id: user_id,
    description: description,
    type: type,
    task_id: task_id,
    related_user_id: related_user_id,
    related_user_first_name: user.first_name,
  });
  if (result) {
    return { success: true };
  } else {
    return { success: false };
  }
}

//addNotification("5f2546def9ca2b000466c467", "Đã follow bạn", "followed", null, "5fb358bd885c830004fe0b3c")

// Get notifications
async function getNotification(user_id, number_notification, skip) {
  let result = await notification
    .find(
      {
        user_id: user_id,
      },
      {},
      { limit: number_notification, skip: skip }
    )
    .sort({ created_time: -1 });
  console.log(result);
  if (result) {
    return { success: true, data: result };
  } else {
    return { success: false };
  }
}

// Set readed notifications
async function setReaded(user_id, notification_id) {
  console.log(user_id);
  console.log(notification_id);
  let result = await notification.updateOne(
    { user_id: user_id, _id: notification_id },
    { is_readed: true }
  );
  console.log(result);
  if (result) {
    return { success: true };
  } else {
    return { success: false };
  }
}
//setReaded("5fb378656eae3400041711a3","5fbe97df7de85600041e61cb");

// Set notification readed
async function setReadedAll(user_id) {
  let result = await notification.updateMany(
    { user_id: user_id, is_readed: false },
    { is_readed: true }
  );
  console.log(result);
  if (result) {
    return { success: true };
  } else {
    return { success: false };
  }
}
//setReadedAll("5fb378656eae3400041711a3")
// Get unread notification
async function getTotalUnreadNotification(user_id) {
  try {
    let unread_number = await notification
      .find({ user_id: user_id, is_readed: false }, {})
      .count();
    return { success: true, data: unread_number };
  } catch (e) {
    throw e;
  }
}
//getTotalUnreadNotification("5f2546def9ca2b000466c467");
//getNotification("5f2546def9ca2b000466c467",1,0)
//setReadedAll("5f3553ba335aa2000433c44f")
module.exports.getNotification = getNotification;
module.exports.setReaded = setReaded;
module.exports.setReadedAll = setReadedAll;
module.exports.addNotification = addNotification;
module.exports.getTotalUnreadNotification = getTotalUnreadNotification;
