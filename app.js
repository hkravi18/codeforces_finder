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
    //console.log(req.body);
    user_profile = req.body.user;
    const user_url = url + "user.info?handles=" + req.body.user;
    //console.log(user_url);
    https.get (user_url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            //console.log(user);
            if (user.status === "FAILED")
            {
                //res.send("<h3>User with handle "+ user_profile +" not found</h3>");
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                //console.log(user);
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
    res.render("secretCode", {key : 1});
})
.post(function(req,res) {
    const secretKey = req.body.secretKey;
    if (secretKey === "keyFriends") {
        let time_unix = unixTimestamp();
        const rand = "123456";
        let ToHash = rand + "/user.friends?apiKey=4c3309c52da9fb394ad07de71b0c970a0b7b879a&time="+time_unix+"#4e671ca7d9585832c3ac28a2d1256bfc9ab7fe90"
        const hash = sha512(ToHash);
        let url ="https://codeforces.com/api/user.friends?&apiKey=4c3309c52da9fb394ad07de71b0c970a0b7b879a&time="+time_unix+"&apiSig="+rand+hash;
        https.get (url, function (response) {
            response.on("data" ,function (data) {
                const user = JSON.parse(data);
                //console.log(user);
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
    } else {
        res.render("secretCode", {key : 0});  
    }
});  
    
//RATING CHANGE 
app.route("/ratingChange")
.get(function (req,res) {
    res.sendFile(__dirname + "/ratingChange.html");
})
.post(function (req,res) {
    const contestId = req.body.contest_id;
    const userHandle = req.body.user;
    const url = "https://codeforces.com/api/user.rating?handle="+userHandle;
    https.get (url, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
            chunks.push(chunk)
        })

        response.on('end', function () {
            const data = Buffer.concat(chunks)
            const user = JSON.parse(data);
            //console.log(user);
            if (user.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                console.log("found");
                res.render("ratingChange",{
                    userName : userHandle,
                    Array : user.result
                });
            } 
        })
    });
});

//Submissions
app.route("/submission")
.get(function (req,res) {
    res.sendFile(__dirname + "/submissions.html");
})
.post(function (req,res) {
    const userHandle = req.body.user;
    const url = "https://codeforces.com/api/user.status?from=1&count=80&handle="+userHandle;
    https.get (url, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
            chunks.push(chunk)
        })

        response.on('end', function () {
            const data = Buffer.concat(chunks)
            const user = JSON.parse(data);
            //console.log(user);
            if (user.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                console.log("found");
                res.render("submissions",{
                    userName : userHandle,
                    Array : user.result
                });
            } 
        })
    });
});

// Upcoming Contests
app.route("/upcomingContest")
.get(function (req,res) {
    const url = "https://codeforces.com/api/contest.list";
    https.get (url, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
            chunks.push(chunk)
        })

        response.on('end', function () {
            const data = Buffer.concat(chunks)
            const user = JSON.parse(data);
            //console.log(user);
            if (user.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                console.log("found");
                res.render("upcomingContests",{
                    Array : user
                });
            } 
        })
    });
});

//PAST CONTESTS
app.route("/pastContest")
.get(function (req,res) {
    const url = "https://codeforces.com/api/contest.list";
    https.get (url, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
            chunks.push(chunk)
        })

        response.on('end', function () {
            const data = Buffer.concat(chunks)
            const user = JSON.parse(data);
            //console.log(user);
            if (user.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
                console.log("found");
                res.render("pastContest",{
                    Array : user
                });
            } 
        })
    });
})
.post(function (req,res) {
    const ContestId =  req.body.contestId;
    let p = 1;
    let url = "https://codeforces.com/api/contest.standings?contestId=" + ContestId + "&handles=";
    let userArray = [];

    let RatingChange = [];
    let obj = {}; 


    User.find({},function (err,found) {
        if (!err) {
            if (found) {
                userArray = found;
                console.log("FOUND");
                console.log(found);
                found.forEach(function (ListUsers) {
                    if (p===1) {
                        url = url + ListUsers.name;
                        p++;
                    } else {
                        url = url + ";" + ListUsers.name;
                        p++;
                    } 
                });

                https.get(url, function (response) {
                    const chunks = []
                    response.on('data', function (chunk) {
                        chunks.push(chunk)
                    })
            
                    response.on('end', function () {
                        const data = Buffer.concat(chunks)
                        const user = JSON.parse(data);
                        //console.log(newUser);
                        console.log("USER");
                        console.log(user);
                        
                        if (user.status === "FAILED")
                        {
                            res.redirect("/failure");
                        }
                        else if (user.status === "OK")
                        {
                            //console.log("CONTESTS");
                            const contest = user.result.contest;
                            //console.log(contest);
                            //console.log("PROBLEMS");
                            const problems = user.result.problems;
                            //console.log(problems);
                            //console.log("ROWS");
                            const rows = user.result.rows;
                            //console.log(rows);
                            console.log("found");
                            res.render("past_contest_user_performance",{
                                problems : problems,
                                contest : contest,
                                rows : rows
                            });
                        } 
                    })
                });
            } else {
                res.sendFile(__dirname + "failure_contest.html");
            }
        } else {
            res.redirect("/error");
        }
    })
});



//CONTESTS 
app.route("/contest")
.post(function (req,res) {
    const user_profile = req.body.user;
    const contestId = req.body.contestId;
    const contestName = req.body.contestName;
    const url = "https://codeforces.com/api/contest.status?contestId=" + contestId + "&handle=" + user_profile;
    //console.log(url);
    https.get (url, function (response) {
        response.on("data" ,function (data) {
            const user = JSON.parse(data);
            //console.log(user.result);
            if (user.status === "FAILED")
            {
                //res.send("<h3>User with handle "+ user_profile +" not found</h3>");
                res.sendFile(__dirname + "/failure_contest.html");   
            }
            else if (user.status === "OK")
            {
                if (user.result.length !== 0) {
                    res.render("contest", 
                    { 
                        Array : user.result,
                        userName : user_profile,
                        contestName : contestName  
                    }
                    ); 
                } else {
                    res.sendFile(__dirname + "/contest_user_not_found.html"); 
                }
            } 
        })
    });
});




function getVerdict(verdictComment) {
    switch (verdictComment) {
        case "FAILED": return 0;
        case "OK": return 1;
        case "PARTIAL": return 2;
        case "COMPILATION_ERROR": return 3;
        case "RUNTIME_ERROR": return 4;
        case "WRONG_ANSWER": return 5;
        case "PRESENTATION_ERROR": return 6;
        case "TIME_LIMIT_EXCEEDED": return 7;
        case "MEMORY_LIMIT_EXCEEDED": return 8;
        case "IDLENESS_LIMIT_EXCEEDED": return 9;
        case "SECURITY_VIOLATED": return 10;
        case "CRASHED": return 11;
        case "INPUT_PREPARATION_CRASHED": return 12;
        case "CHALLENGED": return 13;
        case "SKIPPED": return 14;
        case "TESTING": return 15;
        case "REJECTED": return 16;
    }     
}

function getLanguage(languageComment) {
    
    switch (languageComment) {
        case "GNU C++": return 0;
        case "GNU C++11": return 1;
        case "GNU C++14": return 2;
        case "GNU C++17": return 3;
        case "GNU C++20": return 4;
    }
    if (languageComment.length >=2 && languageComment.substring(0,2) === "C#") {return 5;}  
    if (languageComment.length >=2 && languageComment.substring(0,2) === "Go") {return 6;} 
    if (languageComment.length >=3 && languageComment.substring(0,3) === "PHP") {return 11;}
    if (languageComment.length >=3 && languageComment.substring(0,3) === "Kot") {return 9;} //Kotlin  
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Hask") {return 7;} //Haskell 
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Java") {return 8;}  
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Perl") {return 10;} 
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Rust") {return 15;}     
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Pyth") {return 12;}//Python    
    if (languageComment.length >=4 && languageComment.substring(0,4) === "PyPy") {return 13;}  
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Ruby") {return 14;} 
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Scal") {return 16;}//Scala  
    if (languageComment.length >=4 && languageComment.substring(0,4) === "Node") {return 18;}  //Nodejs
    if (languageComment.length >=6 && languageComment.substring(0,6) === "Javasc") {return 17;}//Javascript
    else {return 19;}      
}

function getProblemType(problemComment) {
    switch (problemComment) {
        case "A": return 0;
        case "B": return 1;
        case "C": return 2;
        case "D": return 3;
        case "E": return 4;
        case "F": return 5;
    }     
}

// EXTRA USER INFO 
app.route("/userGraphicalInfo")
.get(function (req,res) {
    res.sendFile(__dirname + "/userGraphicalInfo.html");
})
.post(function (req,res) {
    const userName = req.body.userName;
    const url = "https://codeforces.com/api/user.status?from=1&handle=" + userName;
    const secondUrl = "https://codeforces.com/api/user.rating?handle="+userName;  
    
    let problems = [];
    let verdict = [];
    let language = [];
    //let problemTypes = [];
    
    let problemsTried = 0;
    let problemsSolved = 0;
    let numberOfContests = 0;
    let bestRank = 20000;
    let worstRank = 0;
    let maxRatingUp = 0;
    let maxRatingDown = 0;

    let arr = [];
    let problemsSubsituteText = [];
    let verdictOptions = ["FAILED", 
            "OK",
            "PARTIAL",
            "COMPILATION_ERROR", 
            "RUNTIME_ERROR", 
            "WRONG_ANSWER", 
            "PRESENTATION_ERROR",
            "TIME_LIMIT_EXCEEDED",
            "MEMORY_LIMIT_EXCEEDED", 
            "IDLENESS_LIMIT_EXCEEDED",
            "SECURITY_VIOLATED", 
            "CRASHED",
            "INPUT_PREPARATION_CRASHED",
            "CHALLENGED",
            "SKIPPED",
            "TESTING",
            "REJECTED"];

    let usedLanguages = [
            "GNU C++",
            "GNU C++ 11",
            "GNU C++ 14",
            "GNU C++ 17",
            "GNU C++ 20",
            "C#",
            "Go",
            "Haskell",
            "Java",
            "Kotlin",
            "Perl",
            "PHP",
            "Python",
            "PyPy",
            "Ruby",
            "Rust",
            "Scala",
            "Javascript",
            "Nodejs",
            "Others"
            ];
    

    
    
    
    https.get(secondUrl, function (response) {
        const secondchunks = []
        response.on('data', function (secondchunk) {
            secondchunks.push(secondchunk)
        })

        response.on('end', function () {
            const secondData = Buffer.concat(secondchunks)
            const userData = JSON.parse(secondData);
            //console.log(newUser);
            //console.log(userData);
            
            if (userData.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (userData.status === "OK")
            {
                numberOfContests = userData.result.length;
                for (let k=0;k<userData.result.length;k++) {
                    if (userData.result[k].rank > worstRank) {
                        worstRank = userData.result[k].rank;
                    }
                    if (userData.result[k].rank < bestRank) {
                        bestRank = userData.result[k].rank;
                    }
                    if ((userData.result[k].oldRating - userData.result[k].newRating) > 0) {
                        if ((userData.result[k].oldRating - userData.result[k].newRating) > maxRatingDown) {
                            maxRatingDown = (userData.result[k].oldRating - userData.result[k].newRating);
                        }
                    } else {
                        if ((userData.result[k].newRating - userData.result[k].oldRating) > maxRatingUp) {
                            maxRatingUp = (userData.result[k].newRating - userData.result[k].oldRating);
                        }
                    }
                }     
            } 
        })
    });
    

    console.log(url);
    console.log(secondUrl);
    
    https.get(url, function (response) {
        const chunks = []
        response.on('data', function (chunk) {
            chunks.push(chunk)
        })

        response.on('end', function () {
            const data = Buffer.concat(chunks)
            const user = JSON.parse(data);
           
            //console.log(user[0]);
            if (user.status === "FAILED")
            {
                res.redirect("/failure");
            }
            else if (user.status === "OK")
            {
            
                let problemSetTried = new Set();
                let problemSetSolved = new Set();

                for (let j=0;j<14;j++) {
                    const text = "["+(800+j*100)+" - " + (900+j*100) + "]";
                    problemsSubsituteText.push(text);
                }

                for (let j=0;j<17;j++) {
                    let obj = {
                        y : 0,
                        indexLabel : verdictOptions[j],
                        color : ""
                    }
                    verdict.push(obj);
                }

                verdict[1].color = "green";
                verdict[5].color = "red";

                for (let j=0;j<14;j++) {
                    let obj = {
                        y : 0,
                        indexLabel : problemsSubsituteText[j]
                    }
                    problems.push(obj);
                }


                for (let j=0;j<20;j++) {
                    let obj = {
                        y : 0,
                        indexLabel : usedLanguages[j],
                        color : ""
                    }
                    language.push(obj);
                }
                
                let typesOfProblems = [
                    "A",
                    "B",
                    "C",
                    "D",
                    "E",
                    "F",
                ];  

                for (let j=0;j<6;j++) {
                    let obj = {
                        y : 0,
                        indexLabel : typesOfProblems[j],
                        color : ""
                    }
                    arr.push(obj);
                }
                //json = JSON.stringify(arr);
                //problemTypes = JSON.parse(json);
                /*console.log("problemTypes_Arr" + arr);  
                console.log("problemTypes_Arr_new" + json);  
                console.log("problemTypes" + problemTypes); */ 

                for (let i=0;i<user.result.length;i++) {
                    let pos_verdict = getVerdict(user.result[i].verdict) ;
                        verdict[pos_verdict].y = verdict[pos_verdict].y + 1;
                    let pos_language = getLanguage(user.result[i].programmingLanguage) ;
                        language[pos_language].y = language[pos_language].y + 1;   
                    if (user.result[i].problem.rating >=700 && user.result[i].problem.rating<800 && user.result[i].verdict === "OK") {
                        problems[0].y = problems[0].y + 1; 
                    } else if (user.result[i].problem.rating >=800 && user.result[i].problem.rating<900 && user.result[i].verdict === "OK") {
                        problems[1].y = problems[1].y + 1; 
                    } else if (user.result[i].problem.rating >=900 && user.result[i].problem.rating<1000 && user.result[i].verdict === "OK") {
                        problems[2].y = problems[2].y + 1;  
                    } else if (user.result[i].problem.rating >=1000 && user.result[i].problem.rating<1100 && user.result[i].verdict === "OK") {
                        problems[3].y = problems[3].y + 1; 
                    } else if (user.result[i].problem.rating >=1100 && user.result[i].problem.rating<1200 && user.result[i].verdict === "OK") {
                        problems[4].y = problems[4].y + 1; 
                    } else if (user.result[i].problem.rating >=1200 && user.result[i].problem.rating<1300 && user.result[i].verdict === "OK") {
                        problems[5].y = problems[5].y + 1; 
                    } else if (user.result[i].problem.rating >=1300 && user.result[i].problem.rating<1400 && user.result[i].verdict === "OK") {
                        problems[6].y = problems[6].y + 1; 
                    } else if (user.result[i].problem.rating >=1400 && user.result[i].problem.rating<1500 && user.result[i].verdict === "OK") {
                        problems[7].y = problems[7].y + 1; 
                    } else if (user.result[i].problem.rating >=1500 && user.result[i].problem.rating<1600 && user.result[i].verdict === "OK") {
                        problems[8].y = problems[8].y + 1; 
                    } else if (user.result[i].problem.rating >=1600 && user.result[i].problem.rating<1700 && user.result[i].verdict === "OK") {
                        problems[9].y = problems[9].y + 1; 
                    } else if (user.result[i].problem.rating >=1700 && user.result[i].problem.rating<1800 && user.result[i].verdict === "OK") {
                        problems[10].y = problems[10].y + 1; 
                    } else if (user.result[i].problem.rating >=1800 && user.result[i].problem.rating<1900 && user.result[i].verdict === "OK") {
                        problems[11].y = problems[11].y + 1; 
                    } else if (user.result[i].problem.rating >=1900 && user.result[i].problem.rating<2000 && user.result[i].verdict === "OK") {
                        problems[12].y = problems[12].y + 1;  
                    } else if (user.result[i].problem.rating >=2000 && user.result[i].problem.rating<2100 && user.result[i].verdict === "OK") {
                        problems[13].y = problems[13].y + 1; 
                    }
 

                    if (user.result[i].verdict === "OK") {
                        problemSetSolved.add(user.result[i].problem.name); 
                        //let pos_arr = getLanguage(user.result[i].problem.index) ;
                        //arr[pos_arr].y = arr[pos_arr].y + 1; 
                    }
                    problemSetTried.add(user.result[i].problem.name); 
                    
                }
            
                
                problemsTried = problemSetTried.size;
                problemsSolved = problemSetSolved.size;
                res.render("userGraphicalInfo",{
                    problems : problems,
                    verdict : verdict,
                    language : language,
                    //problemTypes : arr,
                    problemsTried : problemsTried,
                    problemsSolved : problemsSolved,
                    numberOfContests : numberOfContests,
                    bestRank : bestRank,
                    worstRank : worstRank,
                    maxRatingUp : maxRatingUp,
                    maxRatingDown : maxRatingDown
                }); 
            }
        })
    });

    //console.log("FOUND");
    //console.log(problemTypes); 
    //console.log("FOUND");
    //console.log(problems); 

    
});

            
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
            //console.log(user);
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
                User.findOne(
                    {name : data},
                    function (err,found) {
                        if (!err) {
                            if (found) {
                                res.sendFile(__dirname + "/duplicate.html");  
                            } else {
                                user_info.save();
                                res.redirect("/");
                            }
                        } else {
                            res.redirect("/error");
                        }
                    }
                )
                //console.log("////////////");
                //console.log(user_info);
                //console.log("Inserted");
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
    //console.log(userName);
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
                for (var i=0;i<found.length;i++) {
                    for (var j=i;j<found.length;j++) {
                        if (found[i].rating < found[j].rating)
                        {
                            [found[i] , found[j]] = [found[j] , found[i]]
                        }  
                    }
                }
                //console.log("SHOW LISTS");
                //console.log(found);
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

//GUIDE
app.get("/guide",
    function (req,res) {
        res.sendFile(__dirname + "/guide.html"); 
    }
);

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