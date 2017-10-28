const express=require('express');
const bodyParser=require('body-parser');
const path=require('path');
const cookieParser=require('cookie-parser');
const session = require('express-session');
const btoa=require('btoa');
const MongoStore = require('connect-mongo')(session);
const sha1=require('sha1');
const Db=require('./pollDb.js');
const jwt = require('jsonwebtoken');
const secret = process.env.SESSION_SECRET || 'Tjltaskmklmklm23__#@_T@#GVdsmaksld';
const http=require('http');
const WebSocket=require('ws');

const appPORT=process.env.PORT || 8080;

const app=express();
app.use(cookieParser());
app.use(session({
  store: new MongoStore({
    url: process.env.PROD_DB||'mongodb://localhost:27017/ndlrn',
    ttl: 14 * 24 * 60 * 60 // = 14 days. Default
  }), //https://github.com/jdesboeufs/connect-mongo
  secret: process.env.SESSION_SECRET || 'DREAMSBEDREAMS',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, httpOnly: false, maxAge:(60*60*1000) } //1 hour max age -> DOESN'T WORK WITH SECURE:TRUE ON NON-HTTPS LOCALHOST
}));
app.use('/static',express.static(path.join(__dirname,'/../build/static')));
app.use(['/p'],bodyParser.urlencoded({extended:true}));
app.use(['/d','/add','/vote','/login','/register','/list','/authVerify'],bodyParser.json());

const server=http.createServer(app);
const wss=new WebSocket.Server({server: server});
server.listen(appPORT);

wss.broadcast = function broadcast(data) {
  wss.clients.forEach(function each(client) {
    client.send(data);
  });
};

wss.on('connection', function connection(client) {
  if (client.readyState === client.OPEN) {
    Db.wsHandler(wss.broadcast);
    client.on('message', function incoming(message) {
      if (message) { message=JSON.parse(message); }
      if (message.action==='newClient') {
        Db.grabLastNEvents(4, function(data) {
          client.send(JSON.stringify({type:'initialUpdate', data:data}));
        });
      }
    });
  }
});

//get routes
app.get('/random', function(req,res) {
  let data=[];
  for (var i=0;i<50;i++) {
    data.push(Db.randomPoll());
  }
  data=data.map(d=>d[0]);
  Db.insertManyPolls(data,()=>console.log('insertManyPolls'));
  res.send(JSON.stringify('complete'));
});

app.get('/logout', function(req,res) {
  req.session.destroy();
  res.end(JSON.stringify({msg:'Thank you for stopping by!'}));
});

//post routes
app.post('/d', function(req,res) {
  if (req.body.hName) {
    Db.loadPollByName(req.body.hName, function(data) { //make sure it exists in the database
      if (data) {
        let pollOwner=data[0].username || null; //make sure the user trying to delete owns the poll
        if (pollOwner!==req.body.user) {
          let P={err:`You aren't authorized to delete this poll. Sneaky, sneaky.`};
          res.send(JSON.stringify(P));
        }
        else {
          Db.deletePollByName(req.body.hName, function(){
            res.send(JSON.stringify({msg:'GRAND SUCCESS'}));
          });
        }
      } else {
          let P={err:`There doesn't appear to be a poll by that name in the DB!`};
          res.send(JSON.stringify(P));
        }
    });
  } else {
    let P={err:`Invalid poll ID! Sorry.`};
    res.send(JSON.stringify(P));
    }
});

app.post('/list', function(req,res){
  if (req.body.type=='all') {
    Db.listAllPolls(function(d) {
      if (d) { res.send(JSON.stringify(d));
      } else { res.send(JSON.stringify({err:'NO POLLS ARE AVAILABLE :( so sad!'})); }
    });
  }
  else if (req.body.user) {
    Db.getUserPolls(req.body.user, function(d) {
      if(d) { res.send(JSON.stringify(d)); }
      else { res.send(JSON.stringify({err:'no polls available'})); }
    });
  }
  else { res.send(JSON.stringify({err:'meh we messed up'})); }
});

app.post('/p/:hName', function(req,res) {
  const poll=req.params.hName;
  if(poll!==null) {
    Db.loadPollByName(poll, function(d) {
      if(d) {
        let P={hName:d[0]['hName'],data:d,user:req.session.user};
        res.send(JSON.stringify(d[0]));
      } else { res.send(JSON.stringify({err:'Invalid poll name.'})); }
    });
  }
});

app.post('/vote', function(req,res) {
  if (!Object.keys(req.body).length) { res.end(JSON.stringify({err:'Invalid or malformed request.'})); return false; }
  const sID=req.sessionID;
  const hName=req.body.hName;
  res.writeHead(200, { 'Content-Type': 'text/html' });
  Db.canVote({hName,sID}, function(d) {
    if (d) {
      data={hName:req.body.hName, vote:req.body.vote, sID:sID, username:req.session.user};
      Db.voteOnPoll(data, function() {
        Db.loadPollByName(req.body.hName, function(d) {
          if (d) { res.end(JSON.stringify(d[0])); }
          });
        });
      }
    else { res.end(JSON.stringify({msg:'You already voted. Come back tomorrow!'})); }
    });
  });

app.post('/add', function(req,res) {
  if (!(req.body.pollName||req.body.choices)) {
    res.send(JSON.stringify({err:'Something awful happened on the front-end. A grave miscarriage of JSON!'}));
  }
  if (req.body!=='') {
    let expiresOn = req.body.ttv ? new Date(Date.now()+(1000*60*60*req.body.ttv)) : ''; //60 min/hr, 60 seconds/min, 1000ms/second
    let choices=req.body.choices;
    let potentialName=req.body.pollName.trim().replace(/\W/gi,'-');
    let voteObj={};
    let color = req.body.colors ? req.body.colors : Db.randGrad();
    choices.forEach(c=>voteObj[c]=0);
    let nameCtr=0;
    Db.loadPollsWithPrefix(potentialName,function(data, cb) {
      if (!data) {
        Db.savePoll({colors:color, username:req.body.user, pollName:req.body.pollName, expiresOn:expiresOn, votes:voteObj, hName:potentialName},function(val){
          res.send(JSON.stringify(val.ops[0].hName));
        });
      }
      else {
        potentialName=`${potentialName}-${data.length}`;
        Db.savePoll({colors:color, username:req.body.user, pollName:req.body.pollName, expiresOn:expiresOn, votes:voteObj, hName:potentialName},function(val){
          res.send(JSON.stringify(val.ops[0].hName));
        });
      }
    });
  }
});

app.post('/login', function(req,res) {
  const inputUser=req.body.username;
  const inputPwd=req.body.password;
  if (inputUser===''||inputPwd==='') { res.send(JSON.stringify({'warning':true})); }
  else {
    Db.fetchUser({'username':inputUser},function(D){
      if(D) {
        if ((D[0].username===inputUser)&&(D[0].password===sha1(inputPwd)))
        {
          req.session.user=inputUser;
          var token = jwt.sign({ username: inputUser }, secret, { expiresIn: 86400 });
          res.send(JSON.stringify({msg:'yas', token:token}));
        }
        else {
          req.session.user='';
          res.send(JSON.stringify({'warning':true}));
        }
      } else {
          req.session.user='';
          res.send(JSON.stringify({'warning':true}));
        }
      });
    }
  });

app.post('/authVerify', function(req,res) {
  if (!req.body.token) { res.end(JSON.stringify({msg:nope})); }
  var decoded;
  (()=>{ //TODO more gracefully catch jwt errors?
    try {
      decoded=jwt.verify(req.body.token, secret);
      if (decoded.username===req.body.claimedUser) {
        res.end(JSON.stringify({user:req.body.claimedUser,isValidAuth:true}));
      } else { res.end(JSON.stringify({user:null,isValidAuth:false})); }
    }
    catch(e) { res.end(JSON.stringify({msg:'nope'})); }
  })();
});

app.post('/register', function(req,res) {
  const inputUser=req.body.username;
  const inputPwd=req.body.password;
  if (!inputPwd||!inputUser) {
    let P={warning:true, msg:'Username and password cannot be blank!'};
    res.send(JSON.stringify(P));
  }
  Db.findUser({username:inputUser},function(data){
    if (!data[0]) {
      Db.saveUser({username:inputUser,password:sha1(inputPwd)},function(){ //TODO fix sha1
        req.session.user=inputUser;
        var token = jwt.sign({ username: inputUser }, secret, { expiresIn: 86400 });
        let P={message:`Welcome to Votive, ${inputUser}!`, uName:inputUser, token: token};
        res.send(JSON.stringify(P));
      });
    }
    else {
      let P={warning:true, header:'There is no try.', msg:`${inputUser} is taken.`};
      res.send(JSON.stringify(P));
    }
  });
});

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname+'/../build/index.html'));
});
