const industry = require("../models/IndustriesModel");

async function addNewCareer(industryName, careerName, language){
    let industryDocs = {
        "industry_name" : industryName,
        "career_name" : careerName,
        "language" : language
    };
    
    let result = await industry.create(industryDocs);
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