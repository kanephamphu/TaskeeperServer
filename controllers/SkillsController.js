const skills = require("../models/SkillsModel");

async function addNewSkills(skill){
    let skillDocs = {
        "skill_name" : skill
    }
    let addResult = await skills.create(skillDocs);
    if(addResult){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

async function searchSkills(skill_query){
    let skillList = await skills.find({
        $text : {
            $search : skill_query
        }
    },["_id","skill_name"],{limit : 5});
    console.log(skillList)
    return skillList;
}
//addNewSkills("Quản Lý Thời Gian");
//searchSkills("Ly");
module.exports.addNewSkills = addNewSkills;
module.exports.searchSkills = searchSkills;