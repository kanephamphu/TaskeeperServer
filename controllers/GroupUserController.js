const group = require('../models/GroupUserModel');

//Create new group user
async function addNewGroup(groupname,functions) {
    try{
        var result = await group.create({"group_name" : groupname, "functions" : functions});
        if(result)
            return true;
        else
            return false;
    }catch(e){
        console.log(e);
        throw(e);
    }
}

//Create new function 
async function addNewFunction(groupname,functions) {
    
}

module.exports.addNewGroup = addNewGroup;