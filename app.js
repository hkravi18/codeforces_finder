const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
//const Codeforces = require('codeforces-api');
const https = require("https");
//const ejs = require("ejs");
//Codeforces.setApis('4c3309c52da9fb394ad07de71b0c970a0b7b879a ', '4e671ca7d9585832c3ac28a2d1256bfc9ab7fe90');
var ObjectId = require('mongodb').ObjectId;
const Chart = require('chart.js');
const { stringify } = require("querystring");
//var fileId = mongoose.Types.ObjectId();
const sha512 = require('js-sha512');


function unixTimestamp () {  
    return Math.floor(
      Date.now() / 1000
    )
}

mongoose.connect('mongodb+srv://admin_codeforces:mongomongo@cluster0.dd1zn1z.mongodb.net/usersdb');

const User = mongoose.model('User', { 
    name: String,
    rating : Number,
    rank : String
});

app.use(bodyParser.urlencoded({extended:true}));
app.set('view engine','ejs');
app.use(express.static("public"));

let user_profile= "";
let rating = "";
let maxRank = "";
let friendOfCount = "";
let contribution = "";
let maxRating = "";
let rank = "";
let post_recieved=0;




// HOME ROUTE 
app.route("/")
.get(function(req,res) {
    res.sendFile(__dirname + "/main.html");   
});




app.route("/info")
.get(function (req,res) {
    res.sendFile(__dirname + "/info.html");
    console.log("Get request received");                
})
.post(function (req,res) {
    const url = "https://codeforces.com/api/";
    user_profile = req.body.user;
    const user_url = url + "user.info?handles=" + req.body.user;
    //console.log(user_url);
    https.get (user_url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            console.log(user);
            if (user.status === "FAILED")
            {
                //res.send("<h3>User with handle "+ user_profile +" not found</h3>");
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                console.log(user);
                res.render("info",
                {usersArr : user}
                );
                console.log(user.status);    
            } 
        })
    });
});



/*app.route("/info")
.get(function (req,res) {
    if (post_recieved===0)
        res.sendFile(__dirname + "/info.html"); 
    else if (post_recieved===1)
    {
        post_recieved=0;
        res.render('index.ejs',
        {
            user:user_profile,
            rating:rating,
            rank:rank,
            maxRank:maxRank,
            friendOfCount:friendOfCount,
            contribution:contribution,
            maxRating:maxRating
        }
        );
    }
    console.log("Get request received");                
})
.post(function (req,res) {
    const url = "https://codeforces.com/api/";
    user_profile = req.body.user;
    const user_url = url + "user.info?handles=" + req.body.user;
    //console.log(user_url);
    https.get (user_url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            console.log(user);
            if (user.status === "FAILED")
            {
                res.send("<h3>User with handle "+ user_profile +" not found</h3>");
            }
            else if (user.status === "OK")
            {
                rating = user.result[0].rating;
                maxRank = user.result[0].maxRank;
                friendOfCount = user.result[0].friendOfCount;
                contribution = user.result[0].contribution;
                maxRating = user.result[0].maxRating;
                rank = user.result[0].rank;

                console.log(user.status);    
                post_recieved=1;
                res.redirect("/");
            } 
        })
    });
});*/



//FAILURE
app.route("/failure")
.get(function(req,res){
    res.sendFile(__dirname + "/failure.html"); 
})


//MYFRIENDS
app.route("/myfriends")
.get(function(req,res) {
    let time_unix = unixTimestamp();
    const rand = "123456";
    let ToHash = rand + "/user.friends?apiKey=4c3309c52da9fb394ad07de71b0c970a0b7b879a&time="+time_unix+"#4e671ca7d9585832c3ac28a2d1256bfc9ab7fe90"
    const hash = sha512(ToHash);
    let url ="https://codeforces.com/api/user.friends?&apiKey=4c3309c52da9fb394ad07de71b0c970a0b7b879a&time="+time_unix+"&apiSig="+rand+hash;
    https.get (url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            console.log(user);
            if (user.status === "FAILED")
            {
                //res.send("<h3>User with handle "+ user_profile +" not found</h3>");
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                res.render("myFriends", {Array : user.result});  
            } 
        })
    });
})  
    

// ADD USERS 
app.route("/add")
.get(function(req,res){
    res.sendFile(__dirname + "/addData.html"); 
})
.post(function(req,res){
    const url = "https://codeforces.com/api/";
    user_profile = req.body.user;
    const user_url = url + "user.info?handles=" + req.body.user;
    //console.log(user_url);
    https.get (user_url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            console.log(user);
            if (user.status === "FAILED")
            {
                //res.send("<h3>User with handle "+ user_profile +" not found</h3>");
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                const data = req.body.user;
                const user_info = new User(
                    { name: data ,
                     rating : user.result[0].rating, 
                     rank : user.result[0].rank}
                );
                User.deleteMany(
                    {name : data},
                    function (err) {
                        if (!err) {
                            console.log("delete duplicate");
                        } else {
                            res.redirect("/error");
                        }
                    }
                )
                user_info.save();
                console.log(user_info);
                console.log("Inserted");
                res.redirect("/");
            } 
        })
    });
});







// REMOVE USERS 
app.route("/remove")
.get(function(req,res){
    res.sendFile(__dirname + "/removeUsers.html"); 
})
.post(function (req,res) {
    const userName = req.body.removeUser;
    console.log(userName);
    User.findOne(
        {name : userName},
        function (err,found){
            if (!err) {
                if (found) {
                    User.deleteOne(
                        {_id : found._id},
                        function (err) {
                            if (!err) {
                                res.redirect("/");
                            } else {
                                res.send(err);
                            }
                        }
                    )
                } else {
                    //res.send("No user with the given user handle found.");
                    res.redirect("/failure");
                }
            } else {
                res.redirect("/error");
            }
        }
    ) 
});



//SHOW LIST 
app.route("/showList")
.get(function (req,res) {
    User.find({},function (err,found) {
        if (!err) {
            if (found) {
                console.log(found);
                res.render("Users",
                {users_list : found}
                );
            } else {
                res.send("Not Found");
            }
        } else {
            res.redirect("/error");
        }
    })
    
});






// GRAPH 
app.route("/graph")
.get(function(req,res) {
    User.find(
        function(err,found){
            if (!err){
                if (found) {
                    const dataArr = [];

                    for (var i=0;i<found.length;i++) {
                        let user_color = "";
                        if (found[i].rank == "newbie") {
                            user_color = "grey";
                        } else if (found[i].rank == "pupil") {
                            user_color = "green";
                        } else if (found[i].rank == "specialist") {
                            user_color = "cyan";
                        } else if (found[i].rank == "expert") {
                            user_color = "blue";
                        } else if (found[i].rank == "candidate master") {
                            user_color = "violet";
                        } else if (found[i].rank == "master") {
                            user_color = "orange";
                        } else if (found[i].rank == "international master") {
                            user_color = "#ff8c00";
                        } else if (found[i].rank == "grandmaster") {
                            user_color = "#ad3f3b";
                        } else if (found[i].rank == "international grandmaster") {
                            user_color = "red";
                        } else if (found[i].rank == "legendary grandmaster") {
                            user_color = "#750501";
                        }


                        const obj = {
                        y : found[i].rating,
                        label : found[i].name, 
                        color : user_color       
                        };
                    dataArr.push(obj);
                    }
                    for (var i=0;i<dataArr.length;i++) {
                        for (var j=i;j<dataArr.length;j++) {
                            if (dataArr[i].y > dataArr[j].y)
                            {
                                var temp = dataArr[i].y;
                                dataArr[i].y = dataArr[j].y;
                                dataArr[j].y = temp;
                  
                                temp = dataArr[i].label;
                                dataArr[i].label = dataArr[j].label;
                                dataArr[j].label = temp;

                                temp = dataArr[i].color;
                                dataArr[i].color = dataArr[j].color;
                                dataArr[j].color = temp;
                            }  
                        }
                    }
                    res.render("graph", {Array:dataArr});
                }
            }
        } 
    );
});

//REMOVE ALL 
app.route("/removeAll")
.get(function (req,res) {
    User.deleteMany(
       function (err) {
        if (!err) {
            console.log("Deleted all");
            res.sendFile(__dirname + "/removedAll.html"); 
        } else {
            res.redirect("/error");
        }
       }   
    );
});


//ADD ALL FRIENDS
app.route("/addFriends")
.get(function (req,res) {
    
});


//ERROR
app.route("/error")
.get(function (req,res) {
    res.sendFile(__dirname + "/error.html"); 
});



//FEATURES
app.get("/features",
    function (req,res) {
        res.sendFile(__dirname + "/feature.html"); 
    }
);

//ABOUT 
app.get("/about",
    function (req,res) {
        res.sendFile(__dirname + "/about.html");
    }  
);

//HELP 
app.get("/help",
    function (req,res) {
        res.sendFile(__dirname + "/help.html");
    }  
);

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function (req,res) {
    console.log("Server is running"); 
});


/*app.listen(process.env.PORT || 3000, function (req, res) {
    console.log("Server is running");
}); */




//https://codeforces.com/api/contest.hacks?contestId=566&apiKey=https://codeforces.com/api/contest.hacks?contestId=566&apiKey=xxx&time=1665605165&apiSig=123456<hash>, where <hash> is sha512Hex(123456/contest.hacks?apiKey=xxx&contestId=566&time=1665605165#yyy)&time=1665605165&apiSig=123456<hash>, where <hash> is sha512Hex(123456/contest.hacks?apiKey=xxx&contestId=566&time=1665605165#yyy)



//https://sheltered-anchorage-85442.herokuapp.com/