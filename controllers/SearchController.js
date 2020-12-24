const user = require("../models/UsersModel");
const task = require("../models/TasksModel");
const searchquery = require("../models/SearchQueryModel");
const userController = require("../controllers/UsersController");
const taskController = require("../controllers/TaskController");
//Search
async function searchTask(search_string, user_id = null, limit = 10, skip = 0) {
  /*
    Args:
        search_string: string which user search information
    Returns:
        list user or task suitable for search 
    */
  try {
    let searchResult = await task
      .find(
        { $text: { $search: search_string } },
        { score: { $meta: "textScore" } },
        { limit: limit, skip: skip }
      )
      .sort({ created_time: -1, score: { $meta: "textScore" } });
    if (user_id != null) {
      var data = [];
      for (let i of searchResult) {
        let isSaved = await userController.checkTaskSaved(user_id, i._id);
        let isApplied = await taskController.checkApplied(user_id, i._id);
        if (isSaved.success == true && isApplied.success == true) {
          let docs = {
            _id: i._id,
            task_title: i.task_title,
            task_description: i.task_description,
            created_time: i.created_time,
            location: i.location,
            "price.price_type": i.price.price_type,
            "price.floor_price": i.price.floor_price,
            "price.ceiling_price": i.price.ceiling_price,
            task_owner_id: i.task_owner_id,
            task_owner_first_name: i.task_owner_first_name,
            task_owner_last_name: i.task_owner_last_name,
            task_owner_avatar: i.task_owner_avatar,
            end_day: i.end_day,
            end_month: i.end_month ? i.end_month : null,
            end_year: i.end_year,
            working_time: i.working_time
              ? i.working_time
              : { start_time: null, end_time: null },
            isSaved: isSaved.isSaved,
            isApplied: isApplied.isApplied,
          };
          data.push(docs);
        }
      }
      return data;
    }
    return searchResult;
  } catch (e) {
    throw e;
  }
}

//User Search
async function searchUser(search_string) {
  /*
    Args:
        search_string: string which user search information
    Returns:
        list user or task suitable for search 
    */
  try {
    let searchResult = await user
      .find(
        {
          $text: {
            $search: search_string,
          },
        },
        { score: { $meta: "textScore" } },
        { limit: 20 }
      )
      .sort({
        "votes.vote_count": -1,
        "votes.vote_point_average": -1,
        score: { $meta: "textScore" },
      });
    return searchResult;
  } catch (e) {
    throw e;
  }
}

// Get search trend
async function getSearchTrend() {
  let result = await searchquery
    .find({}, ["query_string"], { limit: 10 })
    .sort({ search_count_recently: -1 });
  return result;
}
// Test
async function test() {
  /*let t = await searchTask("Hoa Kỳ", "5f2546def9ca2b000466c467", 10, 0);
    console.log(t);*/
  let te = await searchUser("Học Tập, Lập Trình");
  console.log(te);
}
//test();
module.exports.getSearchTrend = getSearchTrend;
module.exports.searchTask = searchTask;
module.exports.searchUser = searchUser;
