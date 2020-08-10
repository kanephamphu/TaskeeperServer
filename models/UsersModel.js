const mongoose= require("mongoose");
require('dotenv').config()
mongoose.connect(process.env.mongo_URL);
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
    created_time: {
        type: Number
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
        type: String
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
    working_information: {
        main_skills: {
            type: String
        },
        working_details: [{
            working_id: {
                type: mongoose.Schema.Types.ObjectId,
                index: true,
                required: true,
                auto: true,
            },
            specialize: {
                type: String
            },
            level: {
                type: String
            }  
        }]
    },
    education_information: [{
        education_id: {
            type: mongoose.Schema.Types.ObjectId,
            index: true,
            required: true,
            auto: true,
            },
        education_name: {
            type: String
        },
        education_description: {
            type: String
        }
    }],
    payment_information: [{
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
    email_annoucement_permited: Boolean,
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
        vote_point : Number
    }]
});

const user = mongoose.model("User",UserChema);
module.exports=user;