const industry = require("../models/IndustriesModel");

async function addNewCareer(industryName, careerName, language){
    let isExist = await industry.findOne({"name" : industryName}, ["_id"]);
    if(isExist==null){
        industry.create({"name" : industryName, "language" : language});
    }
    let careerDocs = {
        "name" : careerName
    };
    let result = await industry.updateOne({"name" : industryName, "language" : language}, {
        $push : {
            "detail" : careerDocs
        }
    });
    if(result){
        return {"success" : true};
    }else{
        return {"success" : false};
    }
}

async function getIndustries(language){
    let result = await industry.find({"language" : language});
    if(result){
        return {"success" : true, "data" : result};
    }else{
        return {"success" : false};
    }
}

module.exports.getIndustries = getIndustries;