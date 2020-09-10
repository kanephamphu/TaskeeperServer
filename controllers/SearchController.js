const user = require('../models/UsersModel');
const task = require('../models/TasksModel');
const searchquery = require('../models/SearchQueryModel');

//Search
async function searchTask(search_string){
    /*
    Args:
        search_string: string which user search information
    Returns:
        list user or task suitable for search 
    */
    try{
        let searchResult = await task.find({
            $text : {
                $search : search_string
            }
        },{},{limit : 10}).sort({"search_count" : -1});
        return searchResult;    
    }catch(e){
        throw(e);
    }
};

//User Search
async function searchUser(search_string){
    /*
    Args:
        search_string: string which user search information
    Returns:
        list user or task suitable for search 
    */
    try{
        let searchResult = await user.find({
            $text : {
                $search : search_string
            }
        },{},{limit : 10}).sort({"search_count" : -1});
        return searchResult;    
    }catch(e){
        throw(e);
    }
};

// Get search trend
async function getSearchTrend(){
    let result = await searchquery.find({},["query_string"], {limit : 4}).sort({"search_count_recently" : -1});
    return result;
}
// Test
async function test(){
    let t = await searchTask("Nodejs");
    console.log(t);
    let te = await searchUser("Pham Phu Tai");
    console.log(te);
}

module.exports.getSearchTrend = getSearchTrend;
module.exports.searchTask = searchTask;
module.exports.searchUser = searchUser;