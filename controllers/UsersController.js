var validator = require("validator");
var checker = require("./Check");
const user = require("../models/UsersModel");
var taskController = require("./TaskController");
const news = require("../controllers/NewsController");
const wall = require("../controllers/WallController");
const rtg = require("random-token-generator");
const isValidDay = require("is-valid-date");
const fetch = require("node-fetch");
const { URLSearchParams } = require("url");
const { resolve } = require("path");
const paymentHistoryController = require("./PaymenHistoryController");

//Send verify account email
async function sendVerifyAccountEMail(user_id) {
  try {
    let info = await getVerifyInfo(user_id);
    if (info.success == true) {
      const params = new URLSearchParams();
      params.append("first_name", info.data.first_name);
      params.append("email", info.data.email.current_email);
      params.append(
        "verifylink",
        (
          "https://taskeepererver.herokuapp.com/accountverify?userid=" +
          user_id +
          "&key=" +
          info.data.verify_information.verify_token
        ).toString()
      );
      params.append("verifynumber", info.data.verify_information.verify_code);
      params.append("token", "PhutaI3434344");
      fetch("https://taskeepermail.herokuapp.com/registermail", {
        method: "post",
        body: params,
      })
        .then((res) => res.json())
        .then((json) => console.log(json));
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}
//sendVerifyAccountEMail("5f15dee66d224e19dcbf6bbf");
//Get email verify info
async function getVerifyInfo(user_id) {
  try {
    let result = await user.findOne({ _id: user_id }, [
      "first_name",
      "email.current_email",
      "verify_information.verify_token",
      "verify_information.verify_code",
    ]);
    if (result) {
      return { success: true, data: result };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

//getVerifyInfo("5f15dee66d224e19dcbf6bbf");
// Created verify token for user
async function verifyCreator(user_id) {
  rtg.generateKey(
    {
      len: 32,
      string: true,
      strong: true,
      retry: false,
    },
    async (err, key) => {
      let keyToken = key;
      let verifyNumber = Math.floor(Math.random() * (9999 - 1000) + 1000);
      await user
        .updateOne(
          { _id: user_id },
          {
            "verify_information.verify_code": verifyNumber,
            "verify_information.verify_token": keyToken,
            "verify_information.isUsed": false,
          }
        )
        .exec();
    }
  );
}

// Check token for verify account
async function checkToken(user_id, token) {
  try {
    let result = await user.findOne({
      _id: user_id,
      "verify_information.verify_token": token,
      "verify_information.isUsed": false,
    });
    if (result) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

// Check verify number for verify account
async function checkVerifyNumber(user_id, verifyNumber) {
  try {
    let result = await user.findOne({
      _id: user_id,
      "verify_information.verify_code": verifyNumber,
      "verify_information.isUsed": false,
    });
    if (result) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}
// Set activate by token
async function setActivateByVerifyNumber(user_id, verifyNumber) {
  try {
    let isValid = await checkVerifyNumber(user_id, verifyNumber);
    if (isValid.success == true) {
      let result = await setActive(user_id);
      return result;
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}
//verifyCreator("5f15dee66d224e19dcbf6bbf")
//setActivateByVerifyNumber("5f15dee66d224e19dcbf6bbf",9561)
//setActivateByToken("5f15dee66d224e19dcbf6bbf","4fab53cad9a84b73da5a1c7e28cb5ad4");
// Set activate by token
async function setActivateByToken(user_id, token) {
  try {
    let isValid = await checkToken(user_id, token);
    if (isValid.success == true) {
      let result = await setActive(user_id);
      return result;
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

// Check account status
async function checkUserStatus(user_id) {
  try {
    let result = await user.findOne({ _id: user_id }, ["status"]);
    if (result) {
      return { success: true, status: result.status };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}
//checkUserStatus("5f15dee66d224e19dcbf6bbf");
//verifyCreator("5f15dee66d224e19dcbf6bbf");
//Check login
async function checkLoginQuery(loginquery) {
  if (validator.isEmail(loginquery) || validator.isMobilePhone(loginquery)) {
    return true;
  } else {
    return false;
  }
}
async function checkLogin(loginquery, passwordquery) {
  const password = await user.findOne(
    {
      $or: [
        { "email.current_email": loginquery },
        { "phone_number.current_phone_number": loginquery },
        { "login_information.username": loginquery },
      ],
    },
    "login_information.password"
  );
  if (password != null) {
    if (password.login_information.password == checker.encrypt(passwordquery)) {
      let user = await checkUserStatus(password._id);
      if (user.success == true) {
        if (user.status == "isActive") {
          return "success";
        } else if (user.status == "unActive") {
          return {
            status: { message: "Account is not verify", rule: "unVefiy" },
          };
        } else {
          return {
            status: { message: "Account is suspendd", rule: "suspendd" },
          };
        }
      } else {
        return "falied";
      }
    } else {
      return {
        password: {
          message: "The password is not matched",
          rule: "wrong-password",
        },
      };
    }
  } else {
    return {
      loginquery: {
        message: "Can n't found the email",
        rule: "not-found-email",
      },
    };
  }
}

async function updateWalletAmount(userId, moneyAmount){
  const walletAmount = await paymentHistoryController.getCurrentWalletAmount(userId);

  if(moneyAmount>walletAmount){
    return false;
  }

  const updatedUser = await user.updateOne({ _id: userId }, {"wallet.amount" : Number(walletAmount) - Number(moneyAmount)});

  if(updatedUser){
    return true;
  }

  return false;
}

//Register new account
async function register(first_name, last_name, email, phone_number, password) {
  try {
    if ((await checker.isEmailExist(email)) == false) {
      if ((await checker.isNumberPhoneExist(phone_number)) == false) {
        var userdocs = {
          first_name: first_name,
          last_name: last_name,
          "login_information.password": checker.encrypt(password),
          "phone_number.current_phone_number": phone_number,
          "email.current_email": email,
        };
        const result = await user.create(userdocs);

        if (result) {
          sendVerifyUser(result._id);
          let newsAdded = await news.addNewNews(result._id);
          let wallAdded = await wall.addNewWall(result._id);
          if (wallAdded && newsAdded) {
            if (wallAdded.success == true && newsAdded.success == true) {
            }
          }
          return { success: true };
        } else
          return { success: false, errors: { message: "Cann't register" } };
      } else {
        return {
          success: false,
          errors: {
            message: "Phone number already exists",
            rule: "phoneNumber",
          },
        };
      }
    } else {
      return {
        success: false,
        errors: { message: "Email already exists", rule: "email" },
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
}

// Verify send
async function sendVerifyUser(user_id) {
  const result = await verifyCreator(user_id);
  setTimeout(() => {
    sendVerifyAccountEMail(user_id);
  }, 2000);
}

//Get Group User
async function getGroupUser(id) {
  try {
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Edit personal information
async function editPersonalInfo(
  user_id,
  first_name,
  last_name,
  phone_number,
  gender,
  day_of_birth,
  month_of_birth,
  year_of_birth
) {
  try {
    if (
      day_of_birth != null &&
      month_of_birth != null &&
      year_of_birth != null
    ) {
      let validDay = isValidDay(
        day_of_birth + "/" + month_of_birth + "/" + year_of_birth
      );
      if (validDay) {
        let userDocs = {
          first_name: first_name,
          last_name: last_name,
          "phone_number.current_phone_number": phone_number,
          gender: gender,
          day_of_birth: day_of_birth,
          month_of_birth: month_of_birth,
          year_of_birth: year_of_birth,
        };
        console.log(userDocs);
        let result = await user.updateOne({ _id: user_id }, userDocs);
        if (result) {
          return { success: true };
        } else {
          return { success: false };
        }
      } else {
        return {
          success: false,
          errors: "name"[{ rule: "date", message: "Date is invalid" }],
        };
      }
    } else {
      let userDocs = {
        "phone_number.current_phone_number": phone_number,
        gender: gender,
      };
      let result = await user.updateOne({ _id: user_id }, userDocs);
      if (result) {
        return { success: true };
      } else {
        return { success: false };
      }
    }
  } catch (e) {
    return e;
  }
}

//Get ID by email or phone number or username
async function getUserID(loginquery) {
  try {
    var id = await user.findOne(
      {
        $or: [
          { "email.current_email": loginquery },
          { "phone_number.current_phone_number": loginquery },
          { "login_information.username": loginquery },
        ],
      },
      "_id"
    );
    return id._id;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Get group by ID
async function getGroup(_id) {
  try {
    var group = await user.findOne({ _id: _id }, "group");
    return group.group;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//Get function by ID
async function getFunction(_id) {
  try {
    var group = await user.findOne({ _id: _id }, "function");
    return group.function;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Get Information By ID
async function getInformation(_id) {
  try {
    var information = await user.findOne({ _id: _id }, [
      "login_information.username",
      "avatar",
      "first_name",
      "last_name",
      "votes.vote_point_average",
      "status",
    ]);
    return information;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Change password
async function changePassword(_id, password) {
  try {
    var result = await user.updateOne(
      { _id: _id },
      { "login_information.password": checker.encrypt(password) }
    );
    if (result.n > 0) {
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Add group to user
async function addNewGroup(_id, _groupid) {
  try {
    var result = await checker.isGroupExist(_groupid);
    if (result) {
      if ((await checker.isAlreadyGroup(_id, _groupid)) == false) {
        var result = await user.findOne(
          {
            _id: _id,
          },
          "group"
        );
        result = result.group;
        result.push(_groupid);
        var result1 = await user.update({ _id: _id }, { group: result });
        if (result1) return "success";
        else return "failed";
      } else {
        return "already-in-group";
      }
    } else return "group-not-exists";
  } catch (e) {
    throw e;
  }
}

//Add new working detail
async function addNewWorkingInformation(
  user_id,
  company_name,
  position,
  description,
  time_type,
  from_time,
  to_time
) {
  try {
    var workDocs;
    if (time_type == "past") {
      workDocs = {
        company_name: company_name,
        position: position,
        description: description,
        "time_period.time_type": time_type,
        "time_period.from_time": from_time,
        "time_period.to_time": to_time,
      };
    } else {
      workDocs = {
        company_name: company_name,
        position: position,
        description: description,
        "time_period.time_type": "present",
        "time_period.from_time": from_time,
      };
    }

    let result = await user.updateOne(
      { _id: user_id },
      {
        $push: {
          working_information: workDocs,
        },
      }
    );
    if (result) return { success: true };
    else return { success: false, errors: { message: "Undefined errors" } };
  } catch (e) {
    throw e;
  }
}

//Edit working detail
async function editWorkingInformation(
  user_id,
  work_id,
  company_name,
  position,
  description,
  time_type,
  from_time,
  to_time
) {
  try {
    if (time_type == "past") {
      var result = await user.updateOne(
        {
          _id: user_id,
          "working_information._id": work_id,
        },
        {
          $set: {
            "working_information.$.company_name": company_name,
            "working_information.$.position": position,
            "working_information.$.description": description,
            "working_information.$.time_period": {
              time_type: time_type,
              from_time: from_time,
              to_time: to_time,
            },
          },
        }
      );
    } else {
      var result = await user.updateOne(
        {
          _id: user_id,
          "working_information._id": work_id,
        },
        {
          $set: {
            "working_information.$.company_name": company_name,
            "working_information.$.position": position,
            "working_information.$.description": description,
            "working_information.$.time_period": {
              time_type: time_type,
              from_time: from_time,
            },
          },
        }
      );
    }

    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}

//Delete working detail
async function deleteWorkingInformation(_id, work_id) {
  try {
    var result = await user.updateOne(
      {
        _id: _id,
      },
      {
        $pull: {
          working_information: { _id: work_id },
        },
      }
    );
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
//Add new education detail
async function addNewEducationInformation(
  _id,
  school_name,
  description,
  time_type,
  from_time,
  to_time
) {
  try {
    let eduDocs;
    if (time_type == "past") {
      eduDocs = {
        school_name: school_name,
        description: description,
        "time_period.time_type": time_type,
        "time_period.from_time": from_time,
        "time_period.to_time": to_time,
      };
    } else {
      eduDocs = {
        school_name: school_name,
        description: description,
        "time_period.time_type": "present",
        "time_period.from_time": from_time,
        "time_period.to_time": null,
      };
    }
    let result = await user.updateOne(
      { _id: _id },
      {
        $push: {
          education_information: eduDocs,
        },
      }
    );
    if (result) return { success: true };
    else return { success: true, errors: { message: "Undefined errors" } };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//Edit education
async function editEducationInformation(
  _id,
  education_id,
  school_name,
  description,
  time_type,
  from_time,
  to_time
) {
  try {
    if (time_type == "past") {
      var result = await user.update(
        {
          _id: _id,
          "education_information._id": education_id,
        },
        {
          $set: {
            "education_information.$.school_name": school_name,
            "education_information.$.description": description,
            "education_information.$.time_period.time_type": time_type,
            "education_information.$.time_period.from_time": from_time,
            "education_information.$.time_period.to_time": to_time,
          },
        }
      );
    } else {
      var result = await user.update(
        {
          _id: _id,
          "education_information._id": education_id,
        },
        {
          $set: {
            "education_information.$.school_name": school_name,
            "education_information.$.description": description,
            "education_information.$.time_period": {
              time_type: time_type,
              from_time: from_time,
            },
          },
        }
      );
    }
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}

//Delete education
async function deleteEducationInformation(_id, education_id) {
  try {
    var result = await user.update(
      {
        _id: _id,
      },
      {
        $pull: {
          education_information: { _id: education_id },
        },
      }
    );
    if (result) return { success: true };
    else return { success: false };
  } catch (e) {
    throw e;
  }
}
//Set active account
async function setActive(user_id) {
  try {
    var result = await user.update(
      { _id: user_id },
      { status: "isActive", "verify_information.isUsed": true }
    );
    if (result) {
      taskController.newNewsFeed(user_id);
      return { success: true };
    } else return { success: false, errors: { message: "Undefined errors" } };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

//addListTags("123123", ["tasdf", "sdfsdf"])
//Add new tags from list tags
async function addListTags(user_id, list_tags) {
  for (let i of list_tags) {
    addTags(user_id, i);
  }
}

//Set suspended account
async function setSuspended(_id) {
  try {
    var result = await user.update({ _id: _id }, { status: "suspended" });
    if (result) return { success: true };
    else return { success: false, errors: { message: "Undefined errors" } };
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Get all detail of user
async function getAllDetail(_id) {
  try {
    let detail = await user
      .findOne({ _id: _id }, [
        "avatar",
        "first_name",
        "last_name",
        "gender",
        "description",
        "website",
        "day_of_birth",
        "month_of_birth",
        "year_of_birth",
        "nationality",
        "email.current_email",
        "phone_number.current_phone_number",
        "working_information",
        "education_information",
        "votes.vote_count",
        "votes.vote_point_average",
        "following_number",
        "follower_number",
      ])
      .exec();
    return detail;
  } catch (e) {
    console.log(e);
    throw e;
  }
}

// Get all detail of user
async function getWorkingInfo(_id) {
  try {
    let works = await user
      .findOne({ _id: _id }, ["working_information"])
      .exec();
    if (works) {
      return { success: true, data: works.working_information };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

// Get all detail of user
async function getEduInfo(_id) {
  try {
    let edu = await user
      .findOne({ _id: _id }, ["education_information"])
      .exec();
    if (edu) {
      return { success: true, data: edu.education_information };
    }
    return { success: false };
  } catch (e) {
    return { success: false };
  }
}

// Check is followed
async function checkFollowed(user_id, following_id) {
  let result = await user.findOne(
    { _id: following_id, "followers.follower_id": user_id },
    ["_id"]
  );
  if (result) {
    return { success: true, isFollowing: true };
  } else {
    return { success: true, isFollowing: false };
  }
}

//checkFollowed("5f2546def9ca2b000466c467", "5fb358bd885c830004fe0b3c");
//getEduInfo("5f2546def9ca2b000466c467")
//getWorkingInfo("5f2546def9ca2b000466c467")

// Add follower to follower_list
async function updateFollowingNumber(user_id, number) {
  user
    .updateOne({ _id: user_id }, { $inc: { following_number: number } })
    .exec();
}

//updateFollowerNumber("5fb3f741067baa00047e1a1c", 1);
async function updateFollowerNumber(user_id, number) {
  user
    .updateOne({ _id: user_id }, { $inc: { follower_number: number } })
    .exec();
}

async function addFollower(user_id, follower_id) {
  try {
    let isExist = await user.findOne({
      "followers.follower_id": follower_id,
      _id: user_id,
    });
    if (isExist) {
      return { success: false, errors: { message: "Already follow" } };
    } else {
      let detail = await user.findOne({ _id: follower_id }, [
        "first_name",
        "last_name",
        "avatar",
      ]);
      console.log(detail.first_name);
      let inserted = await user.update(
        { _id: user_id },
        {
          $push: {
            followers: {
              follower_id: follower_id,
              follower_first_name: detail.first_name,
              follower_last_name: detail.last_name,
              avatar: detail.avatar,
            },
          },
        }
      );
      if (inserted) {
        updateFollowingNumber(follower_id, 1);
        updateFollowerNumber(user_id, 1);
        return { success: true };
      } else {
        return {
          success: false,
          errors: { message: "Could n't import to follower list" },
        };
      }
    }
  } catch (e) {
    throw e;
  }
}

// Delete follower from follower list
async function deleteFollower(user_id, follower_id) {
  try {
    let isExist = await user.findOne({
      "followers.follower_id": follower_id,
      _id: user_id,
    });
    if (isExist) {
      let deleted = await user.update(
        { _id: user_id },
        {
          $pull: {
            followers: {
              follower_id: follower_id,
            },
          },
        }
      );
      if (deleted) {
        updateFollowingNumber(follower_id, -1);
        updateFollowerNumber(user_id, -1);
        return { success: true };
      } else {
        return { success: false, errors: { message: "Could not delete" } };
      }
    } else {
      return { success: false, errors: { message: "Did n't follow" } };
    }
  } catch (e) {
    throw e;
  }
}

// Vote user
async function voteUser(
  user_id,
  voter_id,
  vote_point,
  vote_comment,
  voter_first_name,
  voter_last_name,
  voter_avatar
) {
  try {
    let isExist = await user.findOne(
      { _id: user_id, "votes.vote_history.voter_id": voter_id },
      ["_id"]
    );
    if (isExist) {
      let updated = await user.updateOne(
        { _id: user_id, "votes.vote_history.voter_id": voter_id },
        {
          $set: {
            "votes.vote_history.$.vote_point": vote_point,
            "votes.vote_history.$.vote_point": vote_point,
            "votes.vote_history.$.vote_comment": vote_comment,
          },
        }
      );
      if (updated) {
        let voteData = await user.findOne({ _id: user_id }, [
          "votes.vote_history",
        ]);
        let sum = 0;
        let count = voteData.votes.vote_history.length;
        voteData.votes.vote_history.forEach((element) => {
          sum += element.vote_point;
        });
        user
          .updateOne(
            { _id: user_id },
            {
              "votes.vote_count": count,
              "votes.vote_point_average": sum / count,
            }
          )
          .exec();
        return { success: true };
      } else {
        return { success: false, errors: { message: "Could not vote" } };
      }
    } else {
      let added = await user.update(
        { _id: user_id },
        {
          $push: {
            "votes.vote_history": {
              voter_id: voter_id,
              vote_point: vote_point,
              vote_comment: vote_comment,
              voter_first_name: voter_first_name,
              voter_last_name: voter_last_name,
              voter_avatar: voter_avatar,
            },
          },
        }
      );
      if (added) {
        let voteData = await user.findOne({ _id: user_id }, [
          "votes.vote_history",
        ]);
        let sum = 0;
        let count = voteData.votes.vote_history.length;
        voteData.votes.vote_history.forEach((element) => {
          sum += element.vote_point;
        });
        user
          .updateOne(
            { _id: user_id },
            {
              "votes.vote_count": count,
              "votes.vote_point_average": sum / count,
            }
          )
          .exec();
        return { success: true };
      } else {
        return { success: false, errors: { message: "Could not vote" } };
      }
    }
  } catch (e) {
    throw e;
  }
}

//voteUser("5f2546def9ca2b000466c467", "5f1c59289a268609d0a36667", 2);

// Get follower list
async function getFollowerList(user_id) {
  let followers = await user.findOne(
    {
      _id: user_id,
    },
    ["followers"]
  );
  if (followers) {
    return { success: true, data: followers.followers };
  } else {
    return { success: false };
  }
}

// Add search query history to user data
async function addSearchHistory(user_id, query_string) {
  let isExist = await user.findOne({
    "search_queries.search_query": query_string,
    _id: user_id,
  });
  if (isExist) {
    let result = await user.findOne(
      { _id: user_id, "search_queries.search_query": query_string },
      ["search_queries.search_count", "search_queries._id"]
    );
    let search_count = (await result.search_queries[0].search_count) + 1;
    let search_id = await result.search_queries[0]._id;
    let deleted = await user.updateOne(
      { _id: user_id },
      {
        $pull: {
          search_queries: {
            _id: search_id,
          },
        },
      }
    );
    if (deleted) {
      let added = await user.updateOne(
        { _id: user_id },
        {
          $push: {
            search_queries: {
              $each: [
                { search_query: query_string, search_count: search_count },
              ],
              $position: 0,
            },
          },
        }
      );
      if (added) {
        return { success: true };
      } else {
        return { success: false };
      }
    } else {
      return { success: false };
    }
  } else {
    let added = await user.updateOne(
      { _id: user_id },
      {
        $push: {
          search_queries: {
            $each: [{ search_query: query_string, search_count: 1 }],
            $position: 0,
          },
        },
      }
    );
    if (added) {
      return { success: true };
    } else {
      return { success: false };
    }
  }
}

// Get search history
async function getSearchHistory(user_id) {
  let searchHistory = await user.findOne(
    { _id: user_id },
    "search_queries.search_query"
  );
  if (searchHistory) {
    return { success: true, data: searchHistory };
  } else {
    return { success: false };
  }
}

// Save task
async function saveTask(user_id, task_id) {
  let isExist = await user.findOne({
    "task_saved.task_id": task_id,
    _id: user_id,
  });
  if (isExist) {
    return { success: false, errors: { message: "Already saved" } };
  } else {
    let detail = await taskController.getSavedDetail(task_id);
    if (detail == null) {
      return { success: false };
    } else {
      let inseted = await user.updateOne(
        { _id: user_id },
        {
          $push: {
            task_saved: {
              $each: [
                {
                  task_id: task_id,
                  task_owner_id: detail.task_owner_id,
                  task_owner_avatar: detail.task_owner_first_name,
                  task_owner_last_name: detail.task_owner_last_name,
                  task_owner_first_name: detail.task_owner_first_name,
                  task_title: detail.task_title,
                },
              ],
              $position: 0,
            },
          },
        }
      );
      if (inseted) {
        return { success: true };
      } else {
        return { success: false };
      }
    }
  }
}

// Get saved task
async function getSavedTask(user_id, number_task, skip) {
  let result = await user.findOne(
    { _id: user_id },
    { task_saved: { $slice: [skip, number_task] } }
  );
  if (result) {
    console.log(result.task_saved);
    return { success: true, data: result.task_saved };
  } else {
    return { success: false };
  }
}

// Delete saved task
async function deleteSavedTask(user_id, task_saved_id) {
  let result = await user.updateOne(
    { _id: user_id },
    {
      $pull: {
        task_saved: {
          _id: task_saved_id,
        },
      },
    }
  );
  if (result) {
    return { success: true };
  }
  return { success: false };
}

// Get message user data
async function getMessagerData(user_id) {
  try {
    var information = await user.findOne({ _id: user_id }, [
      "avatar",
      "first_name",
      "last_name",
    ]);
    information = {
      _id: information.id,
      name: information.first_name + " " + information.last_name,
      avatar: information.avatar,
    };
    return information;
  } catch (e) {
    console.log(e);
    throw e;
  }
}
//getMessagerData("5f15dee66d224e19dcbf6bbf")
//deleteSavedTask("5f2546def9ca2b000466c467","5f6211b8db0d8214b465f89c")
//getSearchHistory("5f15dee66d224e19dcbf6bbf");
//addSearchHistory("5f15dee66d224e19dcbf6bbf", "Lập trình Unity")
async function testviewJob() {
  //var result = await getAllDetail("5f2546def9ca2b000466c467");
  //var result = await addNewWorkingInformation("5f2546def9ca2b000466c467", "IT", "master")
  //var result1 = await editWorkingInformation("5f17ea80959405207c09f752", "5f3f87226d44ed2e346cd6e2", "Sdf Tai", "level");
  //var result = await editPersonalInfo("5f17ea80959405207c09f752","Tes","Phem","123123","123132","male",16,08,1998);
  //var result = await getFollowerList("5f15dee66d224e19dcbf6bbf");
  //console.log(result.data.followers);
  //console.log(result.education_information[0]);
}
async function addNewLocationInformation(user_id, lat, lng) {
  try {
    let result = await user.updateOne(
      { _id: user_id },
      {
        "location_history.last_location": {
          type: "Point",
          coordinates: [lat, lng],
        },
      }
    );
    let result1 = await user.updateOne(
      { _id: user_id },
      {
        $push: {
          "location_history.location_list": {
            coordinates: [lat, lng],
          },
        },
      }
    );
    if (result1) {
      return { success: true };
    }
    return { success: false };
  } catch (e) {
    throw e;
  }
}
async function avatarChange(user_id, avatar_location) {
  try {
    let result = await user.updateOne(
      { _id: user_id },
      { avatar: avatar_location }
    );
    if (result) {
      updateUserOfAvatarData(user_id, avatar_location);
      taskController.updateAvatarTaskData(user_id, avatar_location);
      return { success: true };
    } else {
      return { success: false };
    }
  } catch (e) {
    return { success: false };
  }
}

// Update user data user schema
async function updateUserOfNameData(user_id, first_name, last_name) {
  try {
    user.updateMany(
      { "votes.vote_history.voter_id": user_id },
      {
        $set: {
          "votes.vote_history.$.voter_first_name": first_name,
          "votes.vote_history.$.voter_last_name": last_name,
        },
      }
    );
    user.updateMany(
      { "followers.follower_id": user_id },
      {
        $set: {
          "followers.$.follower_first_name": first_name,
          "followers.$.follower_last_name": last_name,
        },
      }
    );

    user.updateMany(
      { "task_saved.task_owner_id": user_id },
      {
        $set: {
          "task_saved.$.task_owner_first_name": first_name,
          "task_saved.$.task_owner_last_name": last_name,
        },
      }
    );
  } catch (e) {
    throw e;
  }
}

// Update avatar data user schema
async function updateUserOfAvatarData(user_id, avatar) {
  try {
    user.updateMany(
      { "votes.vote_history.voter_id": user_id },
      {
        $set: {
          "votes.vote_history.$.voter_avatar": avatar,
        },
      }
    );
    user.updateMany(
      { "followers.follower_id": user_id },
      {
        $set: {
          "followers.$.avatar": avatar,
        },
      }
    );

    user.updateMany(
      { "task_saved.task_owner_id": user_id },
      {
        $set: {
          "task_saved.$.task_owner_avatar": avatar,
        },
      }
    );
  } catch (e) {
    throw e;
  }
}

// Add new view task history
async function addNewTaskView(user_id, task_id) {
  try {
    let result = await user
      .updateOne(
        { _id: user_id },
        {
          $push: {
            task_view_history: task_id,
          },
        }
      )
      .exec();
  } catch (e) {
    throw e;
  }
}

// Get task view history
async function getTaskView(user_id, number_task) {
  let result = await user.findOne({ _id: user_id }, ["task_view_history"], {
    task_view_history: { $slice: [0, number_task] },
  });
  if (result.task_view_history == []) {
    return result.task_view_history;
  } else {
    let topTask = await taskController.getTopTask();
    return topTask;
  }
}
//getTaskView("5fb378656eae3400041711a3",5);
// Add tags to user
async function addTags(user_id, tag_name) {
  try {
    let isExist = await user.findOne({ _id: user_id, tags: tag_name }, ["_id"]);
    if (!isExist) {
      let result = await user.updateOne(
        { _id: user_id },
        {
          $push: {
            tags: tag_name,
          },
        }
      );
      if (result) {
        return { success: true };
      } else {
        return { success: false };
      }
    }
    {
      return { success: false };
    }
  } catch (e) {
    throw e;
  }
}

// Check is saved task
async function checkTaskSaved(user_id, task_id) {
  let isSaved = await user.findOne(
    { _id: user_id, "task_saved.task_id": task_id },
    ["_id"]
  );
  if (isSaved) {
    return { success: true, isSaved: true };
  } else {
    return { success: true, isSaved: false };
  }
}

// Get all users list
async function getAllUser() {
  try {
    let userList = await user.find({}, {});
    if (userList) {
      return { success: true, data: userList };
    } else {
      return { success: true, data: [] };
    }
  } catch (e) {
    return { success: false, errors: e };
  }
}

async function searchUserAutoComplete(searchString){
  const searchResult = await user.find({
      $text : {
          $search : searchString
      }
  },["_id", "first_name", "last_name", "avatar", "email.current_email"],{limit : 10}).sort({'search_count' : -1});

  return {success: true, status: 200, data: searchResult};    
}

//addTags("5f2546def9ca2b000466c467", "IT");
//addNewTaskView("5f2546def9ca2b000466c467", "5fb422d241900d0004b6ee58")
//addNewLocationInformation("5f2546def9ca2b000466c467", 165.3, 80)
//addFollower("5f2546def9ca2b000466c467", "5f59fd269a3b8500045c8375");
//addFollower("5f15dee66d224e19dcbf6bbf","5f19a01bb989ab4374ab6c09");
//testviewJob();
//saveTask("5f2546def9ca2b000466c467","5f3629d61e62e1000425540e")
//getSavedTask("5f2546def9ca2b000466c467",1,0)
// getAllUser();
module.exports.getAllUser = getAllUser;
module.exports.addTags = addTags;
module.exports.avatarChange = avatarChange;
module.exports.addNewLocationInformation = addNewLocationInformation;
module.exports.getWorkingInfo = getWorkingInfo;
module.exports.getEduInfo = getEduInfo;
module.exports.getMessagerData = getMessagerData;
module.exports.deleteSavedTask = deleteSavedTask;
module.exports.getSavedTask = getSavedTask;
module.exports.saveTask = saveTask;
module.exports.getSearchHistory = getSearchHistory;
module.exports.addSearchHistory = addSearchHistory;
module.exports.getFollowerList = getFollowerList;
module.exports.editPersonalInfo = editPersonalInfo;
module.exports.voteUser = voteUser;
module.exports.deleteFollower = deleteFollower;
module.exports.addFollower = addFollower;
module.exports.editEducationInformation = editEducationInformation;
module.exports.deleteEducationInformation = deleteEducationInformation;
module.exports.deleteWorkingInformation = deleteWorkingInformation;
module.exports.editWorkingInformation = editWorkingInformation;
module.exports.getAllDetail = getAllDetail;
module.exports.setActive = setActive;
module.exports.setSuspended = setSuspended;
module.exports.addNewWorkingInformation = addNewWorkingInformation;
module.exports.addNewEducationInformation = addNewEducationInformation;
module.exports.addNewGroup = addNewGroup;
module.exports.changePassword = changePassword;
module.exports.getInformation = getInformation;
module.exports.getFunction = getFunction;
module.exports.getGroup = getGroup;
module.exports.getUserID = getUserID;
module.exports.register = register;
module.exports.checkLogin = checkLogin;
module.exports.checkLoginQuery = checkLoginQuery;
module.exports.verifyCreator = verifyCreator;
module.exports.checkUserStatus = checkUserStatus;
module.exports.setActivateByToken = setActivateByToken;
module.exports.setActivateByVerifyNumber = setActivateByVerifyNumber;
module.exports.sendVerifyAccountEMail = sendVerifyAccountEMail;
module.exports.addNewTaskView = addNewTaskView;
module.exports.getTaskView = getTaskView;
module.exports.addListTags = addListTags;
module.exports.checkFollowed = checkFollowed;
module.exports.checkTaskSaved = checkTaskSaved;
module.exports.searchUserAutoComplete = searchUserAutoComplete;
module.exports.updateWalletAmount = updateWalletAmount;
