var MongoClient = require('mongodb').MongoClient;
var ObjectID=require('mongodb').ObjectID;
const Nouns=require('./randomWords').Nouns;
const Adjectives=require('./randomWords').Adjectives;

let db;
let W;
let dbUrl=process.env.PROD_DB||'mongodb://localhost:27017/';

const mustWaitSecondsBeforeVotingAgain=86400;
const disallowDuplicateVotesFromSession=false;

function connect(callback) {
  if (db===undefined) {
    MongoClient.connect(dbUrl, function(err, database){
      if(err) { return callback(err) };
      db=database;
      callback(null, db);
  });
  }
  else { callback(null, db); }
}

connect(function(d){ });

/*POLLS*/
//CRUD:

exports.wsHandler = function(ws) { W=ws; }

function wsConWrapper(args) {
  storeEvents({event:args}, function() { });
  if (W!==undefined) { W(args); }
  else { return null; }
}

const storeEvents = function(data,cb) {
  const now=new Date();
  db.collection("recentActions").insert({event:data.event, createdOn: new Date()}, function(err,data){
    if(!err) { cb(data); }
    else { cb(false); }
  });
}

exports.grabLastNEvents = function(N, cb) {
  db.collection("recentActions").aggregate([
    {$sort: {'createdOn':-1}},
    {$limit: N}
  ]).toArray(function(err, docs) {
  if(!err) { (docs.length) ? cb(docs) : cb(false); }
  });
}

//TODO add flag to display only active, maybe client-side filtering and/or "MORE" polls
//TODO list polls in ascending/decending order of popularity?
exports.listAllPolls = function(cb) {
  db.collection("polls").find({}).sort({createdOn:-1}).toArray(function(err, docs) {
  if(!err) { (docs.length) ? cb(docs) : cb(false); }
  });
}

exports.getUserPolls = function(data,cb) {
  db.collection("polls").find({username:data}).sort({createdOn:-1}).toArray(function(err, docs) {
  if(!err) { (docs.length) ? cb(docs) : cb(false); }
  });
}

const randNum = (min, max) => Math.floor(Math.random()*(max-min))+min;
const gS = [
  [{color: '#F1F2B5', pos: 0},{color: '#135058', pos: 1}],
  [{color: '#7b4397', pos: 0},{color: '#dc2430', pos: 1}],
  [{color: '#136a8a', pos: 0},{color: '#267871', pos: 1}],
  [{color: '#ff0084', pos: 0},{color: '#33001b', pos: 1}],
  [{color: '#FFA17F', pos: 0},{color: '#00223E', pos: 1}],
  [{color: '#360033', pos: 0},{color: '#0b8793', pos: 1}],
  [{color: '#948E99', pos: 0},{color: '#2E1437', pos: 1}],
  [{color: '#780206', pos: 0},{color: '#061161', pos: 1}],
  [{color: '#F0C27B', pos: 0},{color: '#4B1248', pos: 1}],
  [{color: '#FF4E50', pos: 0},{color: '#F9D423', pos: 1}],
  [{color: '#FBD3E9', pos: 0},{color: '#BB377D', pos: 1}],
  [{color: '#606c88', pos: 0},{color: '#3f4c6b', pos: 1}],
  [{color: '#C9FFBF', pos: 0},{color: '#FFAFBD', pos: 1}],
  [{color: '#B993D6', pos: 0},{color: '#8CA6DB', pos: 1}],
  [{color: '#c21500', pos: 0},{color: '#ffc500', pos: 1}],
  [{color: '#FC354C', pos: 0},{color: '#0ABFBC', pos: 1}],
  [{color: '#5f2c82', pos: 0},{color: '#49a09d', pos: 1}],
  [{color: '#E55D87', pos: 0},{color: '#5FC3E4', pos: 1}],
  [{color: '#003973', pos: 0},{color: '#E5E5BE', pos: 1}],
  [{color: '#3CA55C', pos: 0},{color: '#B5AC49', pos: 1}],
  [{color: '#CC95C0', pos: 0},{color: '#DBD4B4', pos: 0.5},{color: '#7AA1D2', pos: 1}],
  [{color: '#833ab4', pos: 0},{color: '#fd1d1d', pos: 0.5},{color: '#fcb045', pos: 1}],
  [{color: '#FEAC5E', pos: 0},{color: '#C779D0', pos: 0.5},{color: '#4BC0C8', pos: 1}],
  [{color: '#77A1D3', pos: 0},{color: '#79CBCA', pos: 0.5},{color: '#E684AE', pos: 1}],
  [{color: '#40E0D0', pos: 0},{color: '#FF8C00', pos: 0.5},{color: '#FF0080', pos: 1}]
];

exports.randGrad = function() { return gS[Math.floor(Math.random()*(gS.length-1))]; }

const randomTags=['cats','bats','wallabies','acroyoga','professional juggling','catherding','hiking','camping','tenting','programming',
'worldsaving','dreaming','biking','running','climbing',"sticky","wordless", "hand-held",  "uninspired",  "in-between",  "grammatical",  "protracted",  "ambivalent",  "aggravated",  "immersive",  "rubber",  "ambient",  "contaminated",  "exasperated",  "idealistic",  "long-held",  "laughable",  "versed",  "penned",  "disabling",  "hooded",  "fading",  "rubber",  "goalless",  "fearless",  "flexible",  "sometime",  "improbable",  "philosophical",  "adjustable",  "primal",  "permissible",  "human",  "healthier",  "left-footed",  "begotten",  "aggravated",  "paced",  "stately",  "ever-present",  "low-budget",  "uppity",  "mind-boggling",  "humid",  "premium",  "uninvited",  "injured",  "frugal",  "diagonal"
];

const randomTag = () => randomTags[Math.floor(Math.random()*(randomTags.length-1))];
const randomNoun = () => Nouns[Math.floor(Math.random()*(Nouns.length-1))];
const randomAdjective = () => Adjectives[Math.floor(Math.random()*(10,450))];

exports.randomPoll = function() {
    return new Promise(function(resolve,reject) {
      let pData=[];
      const randUser = String.fromCharCode(randNum(97,122));
      let hName = randomNoun()+"-"+randomAdjective()+"-"+randomNoun();
      hName=hName.split("-").map(e=>{
        e=e.split("");
        e[0]=e[0].toUpperCase();
        return e.join("");
      }).join("-"); //TitleCase The Poll Name
      let pollName = hName.replace(/-/g,' ');
      const numRandChoices = randNum(2,15);
      const randCreatedMoment = new Date(Date.now()-(1000*randNum(0,100000)));
      const randExpiry = Math.random()>=0.5 ? new Date(Date.now()+(1000*randNum(0,100000))) : null;
      let votes = {};
      let totalVotes=0;
      for (var i=0;i<numRandChoices;i++) {
        const randC = randomNoun();
        votes[randC] = randNum(0,200);
        totalVotes+=votes[randC];
      }
      let accessCt = randNum(1,1000);
      let tags=['randomlyGenerated'];
      tags.push(randomTag());
      tags.push(randomTag());
      tags.push(randomTag());
      pData.push({
      'createdOn':randCreatedMoment,
      'username':randUser,
      'pollName':pollName,
      'expiresOn':randExpiry,
      'colors':gS[Math.floor(Math.random()*(gS.length-1))],
      'votes':votes,
      'totalVotes':totalVotes,
      'accessCt':accessCt,
      'hName':hName,
      'tags':tags
      });
    tags.map((tag,idx)=>{
      db.collection("tags").insert({tag,hName},()=>{if (idx===tags.length-1) {
        resolve(pData);
      }});
    });
  });
}

exports.aggregateTopNTags = function(N, cb) {
  N=Math.max(N, 10);
  db.collection("tags").aggregate([{'$group': {_id:'$tag', count:{$sum:1}}}, {$sort:{"count":-1}}, {$limit: N}])
  .toArray(function(err, docs) {
    if (!err) {
      cb(docs);
    }
  });
}

exports.insertManyPolls = function(data, cb) {
  db.collection("polls").insertMany(data,function(err, data) {
    cb();
  });
}

exports.insertManyPollData = function(data, cb) {
  db.collection("pollData").insertMany(data,function(err, data) {
    cb();
  });
}

exports.savePoll = function(data,cb) {
  let broadcast={evtType:'newPoll', actionTime:new Date(), tags:data.tags, pollName:data.pollName, hName:data.hName, username:data.username};
  db.collection("polls").insert({
    username:data.username,
    pollName:data.pollName,
    createdOn:new Date(),
    expiresOn:data.expiresOn,
    colors:data.colors,
    votes:data.votes,
    totalVotes:0,
    accessCt:0,
    hName:data.hName,
    tags:data.tags
  },
  function(err,data){
    if(!err) {
      wsConWrapper(JSON.stringify(broadcast));
      cb(data);
    } else { cb(false); }
  });
  if (data.tags.length) {
    data.tags.forEach((tag)=>{db.collection("tags").insert({tag:tag,hName:data.hName}); });
  }
}

exports.deletePoll = function(data,cb) {
  let objID=new ObjectID(data);
  db.collection("polls").deleteOne({"_id":objID});
  cb();
}

exports.deletePollByName = function(name,cb) {
  db.collection("polls").deleteOne({hName:name});
  db.collection("tags").remove({hName:name});
  cb();
}

exports.voteOnPoll = function(data,cb) {
  let broadcast=Object.assign(data,{evtType:'newVote', actionTime:new Date()});
  let vote=`votes.${data.vote}`;
  const searchBy={hName:data.hName, sID:data.sID};
  const newValues=Object.assign(searchBy, {voteTime:new Date(),username:data.username});
  db.collection("polls").update({hName:data.hName},{'$inc':{[vote]:1,totalVotes:1}}, function(err, docs){
    wsConWrapper(JSON.stringify(data));
    db.collection("auditTrail").update(searchBy,newValues,{upsert:true},function(res){cb(res);});
    db.collection("voteData").update({hName:data.hName, votingUser:data.username, voteTime:new Date(), voteFor:data.vote},{upsert:true},function(res){cb(res);});
  });
}

exports.loadPollByName = function(name,cb) {
  db.collection("polls").update({'hName':name},{'$inc':{accessCt:1}});
  db.collection("polls").find({'hName':name}).toArray(function(err, docs) {
    if(!err) { (docs.length) ? cb(docs) : cb(false); } });
  }

exports.loadPollsWithPrefix = function(data,cb) {
  let regex=new RegExp(`(${data})`,'i');
  db.collection("polls").find({'hName':regex}).toArray(function(err, docs) {
    if(!err) { (docs.length) ? cb(docs) : cb(false); }
  });
}

exports.loadPollsWithTag = function(tag,cb) {
  db.collection("polls").find({tags:tag}).toArray(function(err, docs) {
    if(!err) { (docs.length) ? cb(docs) : cb(false); }
  });
}

/*USERS*/
//CRUD:
//RETRIEVAL
exports.fetchUser = function(query,cb) { //find a user in the DB given a username, return row
  if (!query.username) { return false; }
  db.collection("users").find({username:query.username}).toArray(function(err, docs) {
    if (!err) {
      db.collection("users").updateOne({username:query.username}, {$set:{lastIn:new Date()}});
      (docs.length>0) ? cb(docs) : cb(false);
      }
  });
}

exports.findUser = function(query,cb) { //find a user in the DB given a username, return row
  db.collection("users").find({username:query.username}).toArray(function(err, docs) {
      if (!err) { (docs.length>0) ? cb(docs) : cb(false); } });
  }

exports.saveUser = function(data,cb) { //save a new user in the DB
  let broadcast=JSON.stringify({evtType:'newUser', actionTime:new Date(), username:data.username});
  db.collection("users").insert({username:data.username,password:data.password,lastIn:new Date()},function(err, docs) {
    wsConWrapper(broadcast);
  });
  cb();
  }

exports.canVote = function (query, cb) {
  if (!disallowDuplicateVotesFromSession) { cb(true); return true; }
  db.collection("auditTrail").find({hName:query.hName, sID:query.sID}).sort({voteTime:-1}).toArray(function(err, docs) {
    if (err) { cb(err); }
    else if (!err&&docs.length) {
      const secondsSincelastVoted=(Date.now() - docs[0].voteTime)/1000;
      return (secondsSincelastVoted<=mustWaitSecondsBeforeVotingAgain) ? cb(false) : cb(true);
    }
    else { cb(true); }
  });
};
