const skills = require("../models/SkillsModel");

async function addNewSkills(skill){
    let skillDocs = {
        "name" : skill
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
    },["_id","name"],{limit : 5});
    return skillList;
}
//searchSkills("Ly");
module.exports.addNewSkills = addNewSkills;
module.exports.searchSkills = searchSkills;