const search = require('../models/SearchQueryModel');
const user = require('../models/UsersModel');
const task = require('../models/TaskModel');
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
            "title" : {
                $regex : search_string
            },
            "description" : {
                $regex : search_string
            },
            "location" : {
                $regex : search_string
            }
        });
        return searchResult;    
    }catch(e){
        throw(e);
    }
};

// Test
async function test(){
    let t = await searchTask("Thanh An");
    console.log(t);
}

test();