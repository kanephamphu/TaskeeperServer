const tags = require("../models/TagsModel");
const { addNewEducationInformation } = require("./UsersController");

async function addNewTag(tag){
    let result = await tags.findOne({"name" : tag});
    if(result){
        let updateResult = await tags.updateOne({"name" : tag},
        {
            $inc : {
                "tag_using_count" : 1,
                "tag_month_using_count" : 1
            }
        });
        console.log(updateResult);
        if(updateResult){
            return {"success" : true}
        }else{
            return {"success" : false}
        }
    }else{
        let tagDocs = {
            "name" : tag,
            "tag_using_count" : 1,
            "tag_month_using_count" : 1
        }
        let addResult = await tags.create(tagDocs);
        if(addResult){
            return {"success" : true};
        }else{
            return {"success" : false};
        }
    }
}

async function searchTags(tag_query){
    let tagList = await tags.find({
        $text : {
            $search : tag_query
        }
    },["_id","name"],{limit : 20});
    //console.log(tagList)
    return tagList;
}


module.exports.addNewTag = addNewTag;
module.exports.searchTags = searchTags;