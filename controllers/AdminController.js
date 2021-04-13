var validator = require("validator");
var checker = require("./Check");
const tasks = require("../models/TasksModel");
const users = require("../models/UsersModel");
const search = require("../models/SearchQueryModel");
var taskController = require("./TaskController");
const news = require("../controllers/NewsController");
const wall = require("../controllers/WallController");
const rtg = require("random-token-generator");
const isValidDay = require("is-valid-date");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const { resolve } = require("path");
//delete Task
async function deleteTask(task_id) {
  try {
    let result = await tasks.deleteOne({ _id: task_id });
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
// delete User
async function deleteUser(User_id) {
  try {
    let result = await users.deleteOne({ _id: User_id });
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
//getTypeJobs
async function getTypeJobs(type_job) {
  try {
    let result = await tasks.find({ task_type: type_job });

    if (result) return { success: true, data: results };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
//getTaskMonth
async function getTaskMonth(key_month, key_year) {
  try {
    let taskList = await tasks.find({}, {});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
        let day = new Date(taskList[i].created_time);
        if (day.getFullYear() == key_year) {
          if (day.getMonth() == key_month) {
            data.push(taskList[i]);
          }
        }
      }
      return data;
    } else return data;
  } catch (e) {
    throw e;
  }
}
//staticalbymonth
async function statisticalByMonth(key_month, key_year) {
  try {
    let taskList = await getTaskMonth(key_month, key_year);
    if (taskList) {
      return { success: true, data: taskList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//getTaskYear
async function getTaskYear(key_year) {
  try {
    let taskList = await tasks.find({}, {});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
        let day = new Date(taskList[i].created_time);
        if (day.getFullYear() == key_year) {
          data.push(taskList[i]);
        }
      }
      return data;
    } else return data;
  } catch (e) {
    throw e;
  }
}
//staticalbyYear
async function statisticalByYear(key_year) {
  try {
    let taskList = await getTaskYear(key_year);
    if (taskList) {
      return { success: true, data: taskList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//apply-rank
async function sortRankTask(arrData,type) {
  try {
    let temp = arrData[0];
    if (arrData) {
      for (let i = 0; i < arrData.length - 1; i++) {
        for (let j = i + 1; j < arrData.length; j++) {
          if(type=="apply_rank"){
            if (arrData[i].task_candidate_apply_list.length < arrData[j].task_candidate_apply_list.length) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }else if(type=="approve_rank"){
            if (arrData[i].work_employee_list.length < arrData[j].work_employee_list.length) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }
          
        }
      }
      return true;
    } else return false;
  } catch (e) {
    throw e;
  }
}
async function rankApplyTask() {
  try {
    let taskList = await tasks.find({},{});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
          data.push(taskList[i]);
      }
      sortRankTask(data,"apply_rank");
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//approve-rank
async function rankApproceTask() {
  try {
    let taskList = await tasks.find({},{});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
          data.push(taskList[i]);
      }
      sortRankTask(data,"approve_rank");
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function sortRankUser(arrData,type) {
  try {
    let temp = arrData[0];
    if (arrData) {
      for (let i = 0; i < arrData.length - 1; i++) {
        for (let j = i + 1; j < arrData.length; j++) {
          if(type=="vote"){
            if (arrData[i].votes.vote_point_average < arrData[j].votes.vote_point_average) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }else if(type=="interactive"){
            if ((arrData[i].task_view_history.length+arrData[i].task_saved.length) < (arrData[j].task_view_history.length+arrData[j].task_saved.length)) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }
          
        }
      }
      return true;
    } else return false;
  } catch (e) {
    throw e;
  }
}
async function rankVoteUser()  {
  try {
    let userList = await users.find({},{});
    let data = [];
    if (userList) {
      for (let i = 0; i < userList.length; i++) {
          data.push(userList[i]);
      }
      sortRankUser(data,"vote");
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function rankInteractiveUser()  {
  try {
    let userList = await users.find({},{});
    let data = [];
    if (userList) {
      for (let i = 0; i < userList.length; i++) {
          data.push(userList[i]);
      }
      sortRankUser(data,"interactive");
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function getVote()  {
  try {
    let userList = await users.find({},["first_name","last_name","votes"]);
    let data = [];
    if (userList) {
      for (let i = 0; i < userList.length; i++) {
          data.push(userList[i]);
      }
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function getAccountIsActive()  {
  try {
    let userList = await users.find({},{});
    let data = [];
    if (userList) {
      for (let i = 0; i < userList.length; i++) {
         if(userList[i].status=="isActive"){
            data.push(userList[i]);
         }
      }
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function getAccountUnActive()  {
  try {
    let userList = await users.find({},{});
    let data = [];
    if (userList) {
      for (let i = 0; i < userList.length; i++) {
         if(userList[i].status=="unActive"){
            data.push(userList[i]);
         }
      }
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function sortRankSearch(arrData,type) {
  try {
    let temp = arrData[0];
    if (arrData) {
      for (let i = 0; i < arrData.length - 1; i++) {
        for (let j = i + 1; j < arrData.length; j++) {
          if(type=="search_count"){
            if (arrData[i].search_count < arrData[j].search_count) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }else if(type=="search_count_recently"){
            if (arrData[i].search_count_recently < arrData[j].search_count_recently) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
          }
          
        }
      }
      return true;
    } else return false;
  } catch (e) {
    throw e;
  }
}
//rank - search
async function rankSearch()  {
  try {
    let searchList = await search.find({},{});
    let data = [];
    if (searchList) {
      for (let i = 0; i < searchList.length; i++) {
            data.push(searchList[i]);     
      }
      sortRankSearch(data,"search_count")
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function rankSearchRecently()  {
  try {
    let searchList = await search.find({},{});
    let data = [];
    if (searchList) {
      for (let i = 0; i < searchList.length; i++) {
            data.push(searchList[i]);     
      }
      sortRankSearch(data,"search_count_recently")
      return { success: true, data: data };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
module.exports.rankSearchRecently = rankSearchRecently;
module.exports.rankSearch= rankSearch;
module.exports.getAccountUnActive= getAccountUnActive;
module.exports.getAccountIsActive= getAccountIsActive;
module.exports.rankInteractiveUser=rankInteractiveUser;
module.exports.rankVoteUser=rankVoteUser;
module.exports.rankApproceTask=rankApproceTask;
module.exports.rankApplyTask = rankApplyTask;
module.exports.statisticalByYear = statisticalByYear;
module.exports.statisticalByMonth = statisticalByMonth;
module.exports.getTypeJobs = getTypeJobs;
module.exports.deleteTask = deleteTask;
module.exports.deleteUser = deleteUser;
module.exports.getVote=getVote;
