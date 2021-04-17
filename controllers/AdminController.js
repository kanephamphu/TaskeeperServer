
const tasks = require("../models/TasksModel");
const users = require("../models/UsersModel");
const search = require("../models/SearchQueryModel");
const tags = require("../models/TagsModel");
const transaction = require("../models/MoneyTransactionModel");
//delete Task
async function deleteTask(task_id) {
  try {
    const result = await tasks.deleteOne({ _id: task_id });
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
// delete User
async function deleteUser(user_id) {
  try {
    const result = await users.deleteOne({ _id: user_id });
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
//year :the year you want to get
//month: month of that year you wan to get
async function getTaskMonth(month,year) {
  try {
    let taskList = await tasks.find({}, {});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
        let day = new Date(taskList[i].created_time);
        if (day.getFullYear() == year) {
          if (day.getMonth() == month) {
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
//year :the year you want to get
//month: month of that year you wan to get
async function handleStatisticalByMonth(month,year) {
  try {
    let taskList = await getTaskMonth(month,year);
    if (taskList) {
      return { success: true, data: taskList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//getTaskYear
//year :the year you want to get
async function getTaskYear(year) {
  try {
    let taskList = await tasks.find({}, {});
    let data = [];
    if (taskList) {
      for (let i = 0; i < taskList.length; i++) {
        let day = new Date(taskList[i].created_time);
        if (day.getFullYear() == year) {
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
//year :the year you want to get
async function handleStatisticalByYear(year) {
  try {
    let taskList = await getTaskYear(year);
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
async function rankApproveTask() {
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
        if(type=="interactive"){
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
    let userList = await users.find().sort({"votes.vote_point_average":-1});
    if (userList) {
      return { success: true, data: userList };
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
    let userList = await users.find({status:"isActive"},{});
    if (userList) {
      return { success: true, data: userList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
async function getAccountUnActive()  {
  try {
    let userList = await users.find({status:"unActive"},{});
    
    if (userList) {
      return { success: true, data: userList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//rank - search
async function rankSearch()  {
  try {
    let searchList = await search.find().sort({"search_count":-1});
    if (searchList) {
      return { success: true, data: searchList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
//rank - search- recently
async function rankSearchRecently()  {
  try {
    let searchList = await search.find().sort({"search_count_recently":-1});
    if (searchList) {
      return { success: true, data: searchList };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
// get - transaction
async function getTransaction() {
  try {
    let transactionlist = await transaction.find({},{});
    if (transactionlist) {
      return { success: true, data: transactionlist };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
// get - tags - type
async function getTagsType() {
  try {
    let tagsList = await tags.find({},{"name":1});
    if (tagsList) {
      return tagsList;
    } else return null;
  } catch (e) {
    throw e;
  }
}
//get - all -tags
async function getTags(){
  try {
    let tagsList = await tasks.find({},{"tags":1,"_id":0});
    let data=[];
    if (tagsList) {
        for(let i=0 ;i < tagsList.length;i++){
          for(let j=0 ;i < tagsList.length;i++){
            data.push(tagsList[i].tags[j])
          }
        }
      return data;
    } else return null;
  } catch (e) {
    throw e;
  }
}
// sort tags
async function sortRankTags(arrData) {
  try {
    let temp = arrData[0];
    if (arrData) {
      for (let i = 0; i < arrData.length - 1; i++) {
        for (let j = i + 1; j < arrData.length; j++) {
            if (arrData[i].tag_count < arrData[j].tag_count) {
              temp = arrData[i];
              arrData[i] = arrData[j];
              arrData[j] = temp;
            }
        }
      }
      return true;
    } else return false;
  } catch (e) {
    throw e;
  }
}
//get - rank - tags
async function getRankTags() {
  try {
    let dataTag = await getTagsType();
    let data= await getTags();
    let datanew=[];
    if (dataTag) {
      for(let i=0;i<dataTag.length;i++) {
        let dem=0;
        for (let j = 0; j < data.length; j++) {
          if(dataTag[i].name === data[j]) {
            dem++;
          }
        }
        datanew.push({name:dataTag[i].name,tag_count:dem,_id:dataTag[i]._id})
        
      }
      sortRankTags(datanew);
      return { success: true, data: datanew };
    } else return { success: false };
  } catch (e) {
    throw e;
  }
}
module.exports.getRankTags = getRankTags;
module.exports.getTransaction = getTransaction;
module.exports.rankSearchRecently = rankSearchRecently;
module.exports.rankSearch = rankSearch;
module.exports.getAccountUnActive = getAccountUnActive;
module.exports.getAccountIsActive = getAccountIsActive;
module.exports.rankInteractiveUser = rankInteractiveUser;
module.exports.rankVoteUser = rankVoteUser;
module.exports.rankApproveTask = rankApproveTask;
module.exports.rankApplyTask = rankApplyTask;
module.exports.handleStatisticalByYear = handleStatisticalByYear;
module.exports.handleStatisticalByMonth = handleStatisticalByMonth;
module.exports.getTypeJobs = getTypeJobs;
module.exports.deleteTask = deleteTask;
module.exports.deleteUser = deleteUser;
module.exports.getVote = getVote;
