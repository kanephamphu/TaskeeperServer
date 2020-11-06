const mongoose= require("mongoose");
require('dotenv').config();
mongoose.connect(process.env.mongo_URL || "mongodb+srv://tai123:tai123@cluster0.fsksm.gcp.mongodb.net/Taskeeper?retryWrites=true&w=majority");
var UserChema = new mongoose.Schema({
    login_information: {
        username:{
            type: String,
            unique: true
        },
        password: {
            type: String
        },
        created_time: {
            type: Number,
            default: Date.now()
        }
    },
    status: {
        type: String,
        enum: ['unActive','isActive','suspended'],
        default: 'unActive'
    },
    created_time : {
        type: Number,
        default: Date.now()
    },
    updated_time: {
        type: Number
    },
    verify_code:  {
        type: String
    },
    avatar: {
        type: String
    },
    first_name: {
        type: String
    },
    last_name: {
        type: String
    },
    gender: {
        type: String,
        enum: ['male','female','undefined'],
        default : 'undefined'
    },
    description: {
        type: String
    },
    website: {
        type: String
    },
    day_of_birth: {
        type: Number
    },
    month_of_birth:{
        type: Number
    },
    year_of_birth: {
        type: Number
    },
    nationality: {
        type: String
    },
    address_list : [{
        address: {
            type: String
        }
    }],
    email: {
        current_email: {
            type: String,
            unique: true
        },
        old_mail_list: [{
            email: {
                type: String
            }
        }]
    },
    phone_number: {
        current_phone_number: {
            type: String,
            unique: true
        },
        old_phone_number_list: {
            phone_number: {
                type: String
            }
        }
    },
    working_information: [{
        company_name : {
            type : String
        },
        position : {
            type : String
        },
        location : {
            type : String
        },
        description: {
            type: String
        },
        time_period: {
            type : {
                type : String,
                enum : ['present','past']
            },
            from_time : {
                type : Number
            },
            to_time : {
                type : Number
            }
        }  
    }],
    education_information: [{
        school_name: {
            type: String
        },
        description: {
            type: String
        },
        time_period: {
            type : {
                type : String,
                enum : ['present','past']
            },
            from_time : {
                type : Number
            },
            to_time : {
                type : Number
            }
        }  
    }],
    payment_information: [{
        _id : false,
        payment_id: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            required: true,
            auto: true,
        },
        payment_information: {
            type: String
        },
        owner_name: {
            type: String
        },
        account_number: {
            type: String
        },
        branch_address: {
            type: String
        },
        branch_name: {
            type: String
        },
        type_payment_information: {
            type: String
        }
    }],
    email_annoucement_permited: {
        type: Boolean
    },
    group: [{
        group_id: {
            type: String
        },
        created_time: {
            type: Number,
            default: Date.now()
        },
        updated_time: {
            type: Number
        },
        is_limited: Boolean
    }],
    function: [{
        function_id: {
            type: String
        },
        created_time: {
            type: Number
        },
        updated_time: {
            type: Number
        },
        is_limited: Boolean
    }],
    votes : [{
        voter_id : String,
        vote_point : {
            type : Number,
            enum: [1,2,3,4,5]
        }
    }],
    followers : [{
        follower_id : String,
        follower_first_name : String,
        follower_last_name : String,
        avatar : String 
    }],
    search_queries : [{
        search_query : {
            type : String
        },
        search_count : {
            type : Number
        },
        last_time : {
            type : Number,
            default : Date.now()
        }
    }],
    task_saved : [{
        task_id : {
            type : String
        },
        task_owner_id : {
            type : String
        },
        task_owner_avatar : {
            type : String
        },
        task_owner_first_name : {
            type : String
        },
        task_title : {
            type : String
        },
        saved_time : {
            type : Number,
            default : Date.now()
        }
    }],
    payment_history : [{
        payer_name : {
            type : String,
            enum : ['paypal','visa']
        },
        payer_payment_id : {
            type : String,
            index: true,
            required: true
        },
        created_time : {
            type: Number,
            default : Date.now()
        },
        updated_time : {
            type: Number
        },
        amount : {
            currency : {
                type : String
            },
            total : {
                type: Number
            }
        },
        success : {
            type : Boolean,
            default : false
        },
        is_money_updated : {
            type : Boolean,
            default : false
        }
    }],
    withdrawal_history : [{
        withdrawal_id : {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            required: true,
            auto: true,
        },
    }],
    wallet : {
        amount : {
            type: Number,
            default : 0
        }
    }
});


UserChema.index(
    {
        first_name : "text",
        last_name : "text"
    }
);
const user = mongoose.model("User",UserChema);
module.exports=user;