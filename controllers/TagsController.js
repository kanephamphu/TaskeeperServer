const tags = require("../models/TagsModel");
const { addNewEducationInformation } = require("./UsersController");

async function addNewTag(tag){
    let result = await tags.findOne({"tag_name" : tag});
    if(result){
        let updateResult = await tags.updateOne({"tag_name" : tag},
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
            "tag_name" : tag,
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
    },["_id","tag_name"],{limit : 5}).sort({'tag_month_using_count' : -1});
    return tagList;
}
//addNewTag("tik tok");
searchTags("ti");
module.exports.addNewTag = addNewTag;
module.exports.searchTags = searchTags;