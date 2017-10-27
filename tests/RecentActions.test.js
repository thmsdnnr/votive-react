//urls
const baseURL='http://localhost:8080';
const addPollURL=baseURL+'/add';
const dashURL=baseURL+'/dash';
const listURL=baseURL+'/list';
const loginURL=baseURL+'/login';
const logoutURL=baseURL+'/logout';
const registerURL=baseURL+'/register';
const basePollURL=baseURL+'/p/';
//selectors
const user='input[name=username]';
const pass='input[name=password]';
const submit='button[type=submit]';
const register='button[type=register]';
const pollName='input[name=pollName]';
const choices='textarea[name=choices]';
const ttv='input[name=ttv]';

//functions
function randomLetter() { return String.fromCharCode(Math.floor(Math.random()*(122-97))+97); }
function randomName() {
  let user=[];
  for (var i=0;i<6;i++) { user.push(randomLetter()); }
  return user.join('');
}
function getToasts() {
  var toasts=document.querySelectorAll('div#toast');
  return Object.keys(toasts).map(key=>toasts[key].innerText);
}
function compareToasters(a,b) { //compares toaster bodies (ignoring time), returns if equal
  a=a.map(e=>e.split(/\n/).slice(1).join("")); //get rid of time component (first line)
  b=b.map(e=>e.split(/\n/).slice(1).join(""));
  console.log(a,b,'comptoast');
  return JSON.stringify(a)===JSON.stringify(b);
}
const toasterSize=4;
const globalObj={};

module.exports = {
  '@disabled': false,
  before(B) { B.execute(function(){sessionStorage.clear();})},
  after(B) { B.end(); },

  'recent actions contains 4 items if big screen': (B) => {
    B.url(listURL)
    .resizeWindow(500,600)
    .useXpath()
    .waitForElementVisible('//span[@id="activityWidget"]',1000)
    .execute(function(data){
      return document.querySelectorAll('//span[@id="activityWidget"]//div');
    }, [], function(result) {
      B.assert.equal(Object.keys(result).length, toasterSize);
    });
  },

  'recent actions is a large font if big screen': (B) => {
    B.url(listURL)
    .resizeWindow(500,600).useCss()
    .waitForElementVisible('span#activityWidget',1000)
    .execute(function(data){
      return document.querySelector('div.event-0').parentNode.style.fontSize;
    }, [], function(result) {
      B.assert.equal(result.value,'0.9em');
    });
  },

  'recent actions still contains 4 items if small screen': (B) => {
    B.url(listURL)
    .resizeWindow(499,600)
    .useXpath()
    .waitForElementVisible('//table[@id="pollT"]',1000)
    .execute(function(data){
      var header=document.querySelectorAll('table#pollT>thead>tr>th');
      return JSON.stringify(Object.keys(header).map(k=>header[k].textContent));
    }, [], function(result) {
      B.assert.equal(result.value, '["Title ","Votes "]')
    });
  },

  'recent actions has small font if small screen': (B) => {
    B.url(listURL)
    .resizeWindow(499,600).useCss()
    .waitForElementVisible('span#activityWidget',1000)
    .execute(function(data){
      return document.querySelector('div.event-0').parentNode.style.fontSize;
    }, [], function(result) {
      B.assert.equal(result.value,'0.7em');
    });
  },

//TODO refactor so does not fail due to side effects when nightwatch "test_workers": true
  'creating a new action pops the oldest action off': (B) => {
    const randomUser=randomName();
    B.url(registerURL).useCss()
    .waitForElementVisible('span#activityWidget',1000)
    .execute(getToasts,[],function(toastCache) {
      B.__toastCache=toastCache.value;
      B.setValue(user,randomUser)
      .setValue(pass,'a')
      .click(submit)
      .pause(2000) //wait for toasts to appear
      .execute(getToasts,[],function(newt) {
        const pre=B.__toastCache;
        const post=newt.value;
        console.log(pre, post);
        B.assert.ok(JSON.stringify(pre)!==JSON.stringify(post));
        const preMatch=pre.slice(0,3).map(e=>e.split(/\n/).slice(1).join(""));
        const postMatch=post.slice(1).map(e=>e.split(/\n/).slice(1).join(""));
        B.assert.equal(JSON.stringify(preMatch),JSON.stringify(postMatch));
      });
    });
  },

  'creating a new user fires newUser toast': (B) => {
    const randomUser=randomName();
    B.url(registerURL).useCss()
    .waitForElementVisible('span#activityWidget',1000)
    .setValue(user,randomUser)
    .setValue(pass,'a')
    .click(submit)
    .pause(2000) //wait for toasts to appear
    .execute(getToasts,[],function(newt) {
      newt=newt.value;
      const newest=newt[0];
      B.assert.equal(newest, `just now\n${randomUser} joined us`);
      B.assert.equal(newest, `just now\n${randomUser} joined us`);
      B.assert.equal(newt.length, toasterSize);
    });
  },

  'opening a new browser instance shows the cached most recent toasts': (B) => {
    B.url(registerURL).useCss()
    .waitForElementVisible('span#activityWidget',1000)
    .execute(getToasts,[],function(toast) {
      toast=toast.value;
      globalObj['oldToast']=toast;
    })
    .execute(function(newWindow){
      window.open(registerURL, null, "height=1024,width=768");
    }, [registerURL])
    .window_handles(function(result) {
      var temp = result.value[1];
      this.switchWindow(temp);
    })
    .waitForElementVisible('span#activityWidget',1000)
    .execute(getToasts,[],function(toast) {
      toast=toast.value;
      B.assert.ok(compareToasters(globalObj.oldToast,toast));
    }).end();
  },

  'creating a new poll fires newPoll toast': (B) => {
    let rando=randomName();
    B.url(loginURL).useCss()
    .setValue(user,'a').setValue(pass,'a')
    .click(submit)
    .waitForElementVisible('table.mui-table',400)
    .url(addPollURL)
    .waitForElementVisible('form#newPoll',1000)
    .setValue(pollName,rando)
    .setValue(choices,'meh\nmover\nbiggun')
    .click(submit)
    .waitForElementVisible('div.chartBox',400)
    .pause(2000) //wait for toasts to appear
    .execute(getToasts,[],function(newt) {
      newt=newt.value;
      globalObj['newPoll']={name:rando,firstChoice:'meh'};
      const newest=newt[0];
      B.assert.equal(newest, `just now\na created\n—${globalObj.newPoll.name}`);
    });
  },

  'voting on a poll fires newVote toast': (B) => {
    B.url(basePollURL+globalObj.newPoll.name)
    .click('button#vote')
    .pause(5000) //wait for toasts to appear
    .execute(getToasts,[],function(newt) {
      newt=newt.value;
      const newest=newt[0];
      B.assert.equal(newest, `just now\na voted for ${globalObj.newPoll.firstChoice}\n—${globalObj.newPoll.name}`);
    });
  }
}
