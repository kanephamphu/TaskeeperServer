const searchquery = require('../models/SearchQueryModel');

// Delete search query
async function deleteSearchQuery(query_string){
    let deleted = await searchquery.deleteOne({"query_string" : query_string});
    if(deleted){
        return {"success" : true};
    }
    return {"success" : false, "errors" : {"message" : "Could n't delete"}};
}

// New search 
async function addSearchQuery(query_string){
    let isExist = await searchquery.findOne({"query_string" : query_string});
    if(isExist){
        let search_query = await searchquery.findOne({"query_string" : query_string},["search_count","search_count_recently"]);
        console.log(search_query);
        let updated = await searchquery.update({"query_string" : query_string},{
            "search_count" : search_query.search_count + 1,
            "search_count_recently" : search_query.search_count_recently +1
        });
        if(updated){
            return {"success" : true};
        }else{
            return {"success" : false, "errors": {"message" : "Could n't update"}};
        } 
    }else{
        let added = await searchquery.create({"query_string" : query_string, "search_count" : 1, "search_count_recently" : 1});
        if(added){
            return {"success" : true};
        }else{
            return {"success" : false, "errors": {"message" : "Could n't add"}};
        }
    }
}

async function test(){
    let t = await addSearchQuery("Phu Tai Chat Vl");
    console.log(t);
    let te = await addSearchQuery("Phu Tai Chatdd Vl");
    console.log(te);
}

module.exports.addSearchQuery = addSearchQuery;