var task = require("../models/TasksModel");
const user = require("../models/UsersModel");
const isValidDay = require("is-valid-date");
const { findOne } = require("../models/UsersModel");
const userController = require("../controllers/UsersController");
const { permittedCrossDomainPolicies } = require("helmet");
const fetch = require("node-fetch");
const newsController = require("../controllers/NewsController");
const _ = require("lodash");
require("dotenv").config();

//Add Freelancer Task
async function addFreelanceTask(
  task_title,
  task_description,
  task_description,
  task_owner_first_name,
  task_owner_last_name,
  task_owner_avatar,
  task_type,
  task_owner_id,
  tags,
  floor_price,
  ceiling_price,
  location,
  price_type,
  languages,
  industry,
  endDay,
  endMonth,
  endYear
) {
  try {
    if (task_type == "freelance") {
      if (endDay != null && endMonth != null && endYear != null) {
        let validDay = isValidDay(endDay + "/" + endMonth + "/" + endYear);
        console.log(validDay);
        if (validDay) {
          console.log(validDay);
          var taskDocs = {
            task_title: task_title,
            task_description: task_description,
            task_requirement: task_requirement,
            task_owner_id: task_owner_id,
            tags: tags,
            "price.price_type": price_type,
            task_type: task_type,
            task_owner_first_name: task_owner_first_name,
            task_owner_last_name: task_owner_last_name,
            task_owner_avatar: task_owner_avatar,
            "price.floor_price": floor_price,
            "price.ceiling_price": ceiling_price,
            location: location,
            languages: languages,
            industry: industry,
            skills: skills,
            end_day: endDay,
            end_month: endMonth,
            end_year: endYear,
          };
          var result = await task.create(taskDocs);
        } else {
          return {
            success: false,
            errors: { rule: "date", message: "Date is invalid" },
          };
        }
      } else {
        var taskDocs = {
          task_title: task_title,
          task_description: task_description,
          task_requirement: task_requirement,
          task_owner_id: task_owner_id,
          tags: tags,
          "price.price_type": price_type,
          task_type: task_type,
          task_owner_first_name: task_owner_first_name,
          task_owner_last_name: task_owner_last_name,
          task_owner_avatar: task_owner_avatar,
          "price.floor_price": floor_price,
          "price.ceiling_price": ceiling_price,
          location: location,
          languages: languages,
          industry: industry,
          skills: skills,
        };
        var result = await task.create(taskDocs);
      }
      if (result) {
        return { success: true, data: result };
      } else {
        return { success: false };
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Add Freelancer Task
async function addTask(
  task_title,
  task_description,
  task_requirement,
  task_owner_first_name,
  task_owner_last_name,
  task_owner_avatar,
  task_type,
  task_owner_id,
  tags,
  floor_price,
  ceiling_price,
  location,
  price_type,
  languages,
  industry,
  skills,
  endDay,
  endMonth,
  endYear,
  working_time
) {
  try {
    if (endDay != null && endMonth != null && endYear != null) {
      let validDay = isValidDay(endDay + "/" + endMonth + "/" + endYear);
      console.log(validDay);
      if (validDay) {
        var taskDocs = {
          task_title: task_title,
          task_description: task_description,
          task_requirement: task_requirement,
          task_owner_id: task_owner_id,
          tags: tags,
          "price.price_type": price_type,
          task_type: task_type,
          task_owner_first_name: task_owner_first_name,
          task_owner_last_name: task_owner_last_name,
          task_owner_avatar: task_owner_avatar,
          "price.floor_price": floor_price,
          "price.ceiling_price": ceiling_price,
          location: location,
          languages: languages,
          industry: industry,
          skills: skills,
          end_day: endDay,
          end_month: endMonth,
          end_year: endYear,
          working_time: working_time,
        };
        var result = await task.create(taskDocs);
        if (result) {
          return { success: true, data: result };
        } else {
          return { success: false };
        }
      } else {
        return {
          success: false,
          errors: "name"[{ rule: "date", message: "Date is invalid" }],
        };
      }
    } else {
      var taskDocs = {
        task_title: task_title,
        task_description: task_description,
        task_requirement: task_requirement,
        task_owner_id: task_owner_id,
        tags: tags,
        "price.price_type": price_type,
        task_type: task_type,
        "price.floor_price": floor_price,
        "price.ceiling_price": ceiling_price,
        location: location,
        task_owner_first_name: task_owner_first_name,
        task_owner_last_name: task_owner_last_name,
        task_owner_avatar: task_owner_avatar,
        languages: languages,
        industry: industry,
        skills: skills,
        working_time: working_time,
      };
      console.log(taskDocs);
      var result = await task.create(taskDocs);
      if (result) {
        return { success: true, data: result };
      } else {
        return { success: false };
      }
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Get tasks by number of tasks
async function getTasks(number_task, skip) {
  try {
    let listTasks = await task
      .find(
        {},
        [
          "_id",
          "task_title",
          "task_description",
          "created_time",
          "location",
          "price.price_type",
          "price.floor_price",
          "price.ceiling_price",
          "end_day",
          "end_month",
          "end_year",
          "working_time",
          "isDone",
        ],
        { limit: number_task, skip: skip }
      )
      .exec();
    return listTasks;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//View Job History
async function viewTaskHistoryList(employee_id, number_of_skip) {
  try {
    //Job Finding Condition
    let condition = {
      "work_employee._id_employee": employee_id,
    };
    let listJobs = await task
      .find(
        condition,
        [
          "_id",
          "task_owner_id",
          "task_title",
          "month_of_working_done",
          "year_of_working_done",
          "votes.vote_point",
        ],
        { skip: number_of_skip }
      )
      .exec();
    return listJobs;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//View Task Detail
async function viewTaskDetail(task_id) {
  try {
    let taskDetail = await task.findOne({ _id: task_id }, {});
    if (taskDetail) {
      return taskDetail;
    } else {
      return {};
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

async function test() {
  var tags = [];
  tags.push("Lập Trình");
  var result = await addTask(
    "Tuyển lập trình viên React Native",
    "Lập Trình Dự Án",
    "freelance",
    "5f15dee66d224e19dcbf6bbf",
    tags,
    "500",
    "700",
    "Thanh An- Điện Hồng- Quảng Nam",
    "unextract"
  );
  console.log(result);
}

// Employee apply to the task
async function addApplicationJob(user_id, task_id, introduction, price) {
  try {
    let isApplied = await task.findOne(
      {
        _id: task_id,
        "task_candidate_apply_list.candidate_id": user_id,
      },
      "_id"
    );

    if (isApplied == null) {
      let user = await userController.getInformation(user_id);
      let applyTask = await task.update(
        { _id: task_id },
        {
          $push: {
            task_candidate_apply_list: {
              candidate_id: user_id,
              introduction: introduction,
              price: price,
              candidate_first_name: user.first_name,
              candidate_last_name: user.last_name,
              candidate_avatar: user.avatar,
            },
          },
        }
      );
      if (applyTask) {
        let listTags = await getTagsOfJob(task_id);
        if (listTags.success == true) {
          userController.addListTags(user_id, listTags.data);
        }
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return { success: false, errors: { message: "Already applied" } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Get all task
async function getAllTask() {
  try {
    let taskList = await task.find({}, {});
    if (taskList) {
      return { success: true, data: taskList };
    } else {
      return { success: true, data: [] };
    }
  } catch (e) {
    return { success: false, errors: e };
  }
}
// Get all task information
async function getTaskDetail(task_id) {
  try {
    let result = await task.findOne({ _id: task_id }, {});
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false, errors: e };
  }
}

// Get list tags from job
async function getTagsOfJob(task_id) {
  let result = await task.findOne({ _id: task_id }, ["tags"]);
  if (result) {
    return { success: true, data: result.tags };
  } else {
    return { success: false };
  }
}

//getTagsOfJob("5fb41e3d41900d0004b6ee54");
// Delete application of job
async function deleteApplicationJob(user_id, task_id) {
  try {
    let isApplied = await task.findOne({
      _id: task_id,
      "task_candidate_apply_list.candidate_id": user_id,
    });

    if (isApplied) {
      let deleteTask = await task.update(
        { _id: task_id },
        {
          $pull: {
            task_candidate_apply_list: {
              candidate_id: user_id,
            },
          },
        }
      );

      if (deleteTask) {
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return { success: false, errors: { message: "Did n't apply" } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Update job application of job
async function updateApplicationJob(user_id, task_id, introduction, price) {
  try {
    let isApplied = task
      .findOne({
        _id: task_id,
        "task_candidate_apply_list.candidate_id": user_id,
      })
      .exec();
    if (isApplied) {
      let applyTask = task
        .update(
          {
            _id: task_id,
            "task_candidate_apply_list.candidate_id": user_id,
          },
          {
            $set: {
              task_candidate_apply_list: {
                candidate_id: user_id,
                introduction: introduction,
                price: price,
              },
            },
          }
        )
        .exec();

      if (applyTask) {
        return { success: true };
      }
      return { success: false, errors: { message: "Undefined errors" } };
    } else {
      return { success: false, errors: { message: "Already applied" } };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Get job applicant list
async function getApplyList(task_id) {
  let candidate_apply_list = await task.findOne(
    {
      _id: task_id,
    },
    ["task_candidate_apply_list"]
  );
  if (candidate_apply_list) {
    let list = [];
    for (let i of candidate_apply_list.task_candidate_apply_list) {
      let user = await userController.getInformation(i.candidate_id);
      list.push({
        applied_time: i.applied_time,
        _id: i._id,
        candidate_id: i.candidate_id,
        introduction: i.introduction,
        price: i.price,
        candidate_first_name: i.candidate_first_name,
        candidate_last_name: i.candidate_last_name,
        candidate_avatar: i.candidate_avatar,
        vote_average: user.votes.vote_point_average,
      });
    }
    return { success: true, data: list };
  } else {
    return { success: false };
  }
}
//getApplyList("5fb422d241900d0004b6ee58")
// Get job work employee list
async function getWorkEmployeeList(task_id) {
  let work_employee_list = await task.findOne(
    {
      _id: task_id,
    },
    ["work_employee_list"]
  );
  if (work_employee_list) {
    return { success: true, data: work_employee_list };
  } else {
    return { success: false };
  }
}

// Get job saved detail
async function getSavedDetail(task_id) {
  let detail = await task.findOne({ _id: task_id }, [
    "task_owner_id",
    "task_owner_avatar",
    "task_owner_first_name",
    "task_owner_last_name",
    "task_title",
  ]);
  increaseImpression(task_id);
  return detail;
}

// Task increase impression
async function increaseImpression(task_id) {
  try {
    let result = await task.updateOne(
      { _id: task_id },
      {
        $inc: { impression: 1 },
      }
    );
    if (result) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

//increaseImpression("5f1c581dcde7010774853652");
// Get list job which a client applied
async function getAppliedJobs(user_id) {
  let listJobs = await task.find(
    {
      "task_candidate_apply_list.candidate_id": user_id,
    },
    ["task_title", "task_type", "position", "task_owner_avatar"]
  );
  if (listJobs) {
    return { success: true, data: listJobs };
  } else {
    return { success: false };
  }
}
//getAppliedJobs("5fb358bd885c830004fe0b3c");
// Get list job which a client applied
async function getApprovedJobs(user_id) {
  let listJobs = await task.find(
    {
      "work_employee_list.employee_id": user_id,
    },
    ["task_title", "task_type", "position", "task_owner_avatar"]
  );
  if (listJobs) {
    return { success: true, data: listJobs };
  } else {
    return { success: false };
  }
}

// Set task done
async function setTaskDone(task_owner_id, task_id) {
  let result = task.updateOne(
    { _id: task_id, task_owner_id: task_owner_id },
    { isDone: true }
  );
  if (result) {
    return { sucess: true };
  } else {
    return { success: false };
  }
}

// Get task manage
async function getTaskManage(task_owner_id, number_task, skip) {
  try {
    let result = await task
      .find(
        { task_owner_id: task_owner_id },
        ["task_title", "created_time", "task_owner_avatar"],
        { limit: number_task, skip: skip }
      )
      .sort({ created_time: -1 });
    if (result) {
      let list = [];
      for (const i of result) {
        list.push({
          task_title: i.task_title,
          applier_number: await getCandidateNumber(i._id),
          _id: i._id,
          task_owner_avatar: i.task_owner_avatar,
        });
      }
      return { success: true, data: result };
    } else return { success: false };
  } catch (e) {
    return { success: false };
  }
}
//getTaskManage("5fb378656eae3400041711a3",10,0)
// Client send approve work
async function approveEmployeeToWork(task_owner_id, task_id, employee_id) {
  let approved = await task.findOne({
    _id: task_id,
    task_owner_id: task_owner_id,
    "work_employee_list.employee_id": employee_id,
  },
  "_id");
  if(approved == null){
    let applyInfo = await task.findOne(
      {
        _id: task_id,
        task_owner_id: task_owner_id,
        "task_candidate_apply_list.candidate_id": employee_id,
      },
      "task_candidate_apply_list"
    );
    if (applyInfo) {
      let price = applyInfo.task_candidate_apply_list.price;
      let user = await userController.getInformation(employee_id);
      let result = await task.updateOne(
        {
          _id: task_id,
          task_owner_id: task_owner_id,
          "task_candidate_apply_list.candidate_id": employee_id,
        },
        {
          $push: {
            work_employee_list: {
              employee_id: employee_id,
              price: price,
              employee_first_name: user.first_name,
              employee_last_name: user.last_name,
              employee_avatar: user.avatar,
            },
          },
        }
      );
      if (result) {
        return { success: true };
      }
      return { success: false, };
    }
    return { success: false, "errors" : {"message" : "Didn't apply"}};
  }
  return { success: false, "errors" : {"message" : "Already Aprove"}};
}


// Get candidate list
async function getCandidateNumber(task_id) {
  let result = await task.findOne({ _id: task_id }, [
    "task_candidate_apply_list",
  ]);
  if (result) {
    return result.task_candidate_apply_list.length;
  }
}
//getCandidateNumber("5fb425c241900d0004b6ee5c");
// Get task owner id
async function getTaskOwnerId(task_id) {
  let owner_id = await task
    .findOne(
      {
        _id: task_id,
      },
      ["task_owner_id"]
    )
    .exec();
  if (owner_id) {
    return owner_id.task_owner_id;
  } else {
    return null;
  }
}

async function testviewJob() {
  //var result =  await addFreelanceTask("Tuyển thành viên tập đoàn đa cấp ","Lương tháng 7 tỉ", "Ti", "Phu",
  //"sdsdf",'freelance', "123", ["Lập Trình"], 76,445,"Vl", 'unextract');
  //var result = await viewTaskDetail("5f1c581dcde7010774853652");
  //var result = await viewTasks(10, 10);
  //var result = await getAppliedJobs("5f19a81b1cc2f7000458a566");
  //var result = await addApplicationJob("5f2ac25e8e857e00041dc2b8","5f1c581dcde7010774853652", "Hddd",34, 65);
  //console.log(result);
  let t = await approveEmployeeToWork("5fb378656eae3400041711a3","5fe38eee0aa6a70004aac622","5fb358bd885c830004fe0b3c");
  console.log(t);
}
//testviewJob()
// Get list employee
async function getWorkEmployee(task_owner_id) {
  try {
    let data = [];
    let employeeList = await task
      .find({ task_owner_id: task_owner_id }, [
        "work_employee_list",
        "task_title",
        "task_owner_avatar",
      ])
      .sort({ created_time: -1 });
    for (let i of employeeList) {
      if (i.work_employee_list.length != 0) {
        data.push(i);
      }
    }

    return { success: true, data: data };
  } catch (e) {
    return { success: false };
  }
}

// Update user data task
async function updateUserNameTaskData(user_id, first_name, last_name) {
  try {
    task
      .updateMany(
        { task_owner_id: user_id },
        {
          task_owner_first_name: first_name,
          task_owner_last_name: last_name,
        }
      )
      .exec();
    task.updateMany(
      { "task_candidate_apply_list.candidate_id": user_id },
      {
        $set: {
          "task_candidate_apply_list.$.candidate_first_name": first_name,
          "task_candidate_apply_list.$.candidate_last_name": last_name,
        },
      }
    );
    task.updateMany(
      { "work_employee_list.employee_id": user_id },
      {
        $set: {
          "work_employee_list.$.employee_first_name": first_name,
          "work_employee_list.$.employee_first_name": last_name,
        },
      }
    );
  } catch (e) {
    throw e;
  }
}

// Update user data task
async function updateAvatarTaskData(user_id, avatar) {
  try {
    task
      .updateMany(
        { task_owner_id: user_id },
        {
          task_owner_avatar: avatar,
        }
      )
      .exec();
    task.updateMany(
      { "task_candidate_apply_list.candidate_id": user_id },
      {
        $set: {
          "task_candidate_apply_list.$.candidate_avatar": avatar,
        },
      }
    );
    task.updateMany(
      { "work_employee_list.employee_id": user_id },
      {
        $set: {
          "work_employee_list.$.employee_avatar": avatar,
        },
      }
    );
  } catch (e) {
    throw e;
  }
}

// Recommend task for candidate
async function recommendTask(user_id) {
  try {
    let task_history = await userController.getTaskView(user_id, 5);
    let url =
      "http://34.72.96.216/recommend?secret_token=Taibodoiqua&measure=cosine&k=10";

    task_history.forEach((element) => {
      url = url + "&task_id=" + element._id;
    });
    let res = await fetch(url, {
      method: "get",
    });
    res = await res.json();
    var listID = [];
    res.forEach((element) => {
      listID.push(element.task_id);
    });

    let result = await task.find(
      {
        _id: {
          $in: listID,
        },
      },
      [
        "task_owner_first_name",
        "task_owner_last_name",
        "location",
        "task_title",
        "task_owner_avatar",
        "task_owner_id",
        "task_description",
      ]
    );
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (e) {
    throw e;
  }
}
// Recommend task based on id
async function recommendTaskBasedOnTaskID(task_id) {
  try {
    let url =
      "http://34.72.96.216/recommend?secret_token=Taibodoiqua&measure=cosine&k=10&task_id=" +
      task_id;
    let res = await fetch(url, {
      method: "get",
    });
    res = await res.json();
    var listID = [];
    res.forEach((element) => {
      listID.push(element.task_id);
    });

    let result = await task.find(
      {
        _id: {
          $in: listID,
        },
      },
      [
        "task_owner_first_name",
        "task_owner_last_name",
        "location",
        "task_title",
        "task_owner_avatar",
        "task_owner_id",
        "task_description",
      ]
    );
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (e) {
    throw e;
  }
}

// Recommend task for candidate
async function recommendCandidate(task_id) {
  try {
    let tags = await task.findOne({ _id: task_id }, ["tags"]);
    tags = tags.tags;
    let searchResult = await user
      .find(
        {
          $text: {
            $search: tags.toString(),
          },
        },
        { score: { $meta: "textScore" } },
        { limit: 1 }
      )
      .sort({ "votes.vote_point_average": -1, score: { $meta: "textScore" } });
    let candidateID;
    if (searchResult) {
      candidateID = searchResult[0]._id;
    } else {
      candidateID = "5fb358bd885c830004fe0b3c";
    }
    let url =
      "http://34.72.96.216/candidaterecommend?secret_token=Taibodoiqua&measure=cosine&k=10&candidate_id=" +
      candidateID;
    let res = await fetch(url, {
      method: "get",
    });
    res = await res.json();
    var listID = [];
    res.forEach((element) => {
      listID.push(element.user_id);
    });
    let result = await user.find(
      {
        _id: {
          $in: listID,
        },
      },
      ["first_name", "last_name", "avatar", "votes.vote_point_average"]
    );
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (e) {
    throw e;
  }
}

async function getNearTask(coordinates) {
  const listTasks = await task.find(
    {
      "location.geometry.location.coordinates": {
        $near: {
          $geometry: { type: "Point", coordinates: coordinates },
          $minDistance: 0,
          $maxDistance: 20000,
        },
      },
    },
    [
      "task_owner_avatar",
      "task_title",
      "task_type",
      "location.geometry.location.coordinates",
    ],
    { limit: 10 }
  );
  if (listTasks) {
    return { success: true, data: listTasks };
  }
  return { success: false };
}

//getNearTask([-73.9667, 40.78]);

//recommendTask("5f2546def9ca2b000466c467");
//recommendCandidate("5fc0c03f98802000044a3f39")
// Popular by ID news
async function newNewsFeed(user_id) {
  try {
    const latestNews = await task
      .find({}, ["_id"], { limit: 30 })
      .sort({ created_time: -1 });
    _.map(latestNews, (el) => {
      newsController.addNews(user_id, el._id);
    });
  } catch (e) {
    throw e;
  }
}
//newNewsFeed("5fbfcc39926ea40004b8f6ec");
// Get top task
async function getTopTask() {
  let task_id = await task
    .find({ isDone: false }, ["_id", "impression"])
    .sort({ impression: -1 })
    .limit(1);
  return task_id;
}

// Check is apply task
async function checkApplied(user_id, task_id) {
  let result = await task.findOne(
    { _id: task_id, "task_candidate_apply_list.candidate_id": user_id },
    ["_id"]
  );
  if (result) {
    return { success: true, isApplied: true };
  } else {
    return { success: true, isApplied: false };
  }
}

async function searchUser(userId, )


//getWorkEmployee("5fb378656eae3400041711a3");
//deleteApplicationJob("5f2546def9ca2b000466c467","5f3629ac1e62e1000425540c")
//testviewJob();
//addApplicationJob("5fb358bd885c830004fe0b3c", "5fb425c241900d0004b6ee5c", "Mình thích làm lắm", 1000);
//approveEmployeeToWork("5f2546def9ca2b000466c467", "5fbd77093bdad20004711e74", "5fb358bd885c830004fe0b3c")
module.exports.updateUserNameTaskData = updateUserNameTaskData;
module.exports.updateAvatarTaskData = updateAvatarTaskData;
module.exports.getWorkEmployee = getWorkEmployee;
module.exports.getTaskOwnerId = getTaskOwnerId;
module.exports.getSavedDetail = getSavedDetail;
module.exports.getAppliedJobs = getAppliedJobs;
module.exports.getApplyList = getApplyList;
module.exports.updateApplicationJob = updateApplicationJob;
module.exports.deleteApplicationJob = deleteApplicationJob;
module.exports.addApplicationJob = addApplicationJob;
module.exports.viewTaskDetail = viewTaskDetail;
module.exports.viewTaskHistoryList = viewTaskHistoryList;
module.exports.addFreelanceTask = addFreelanceTask;
module.exports.addTask = addTask;
module.exports.getTasks = getTasks;
module.exports.setTaskDone = setTaskDone;
module.exports.approveEmployeeToWork = approveEmployeeToWork;
module.exports.getTaskManage = getTaskManage;
module.exports.recommendTask = recommendTask;
module.exports.getTopTask = getTopTask;
module.exports.newNewsFeed = newNewsFeed;
module.exports.recommendCandidate = recommendCandidate;
module.exports.checkApplied = checkApplied;
module.exports.getAllTask = getAllTask;
module.exports.getTaskDetail = getTaskDetail;
module.exports.recommendTaskBasedOnTaskID = recommendTaskBasedOnTaskID;
module.exports.getApprovedJobs = getApprovedJobs;
module.exports.getNearTask = getNearTask;
