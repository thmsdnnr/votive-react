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

let globalObj = {};

module.exports = {
  '@disabled': false,
  before(B) { B.execute(function(){sessionStorage.clear();})},
  after(B) { B.end(); },

  'open the first poll on the list': (B) => {
    B.url(listURL)
    .waitForElementVisible('table#pollT',500)
    .useXpath().getText('//table[@id="pollT"]//tbody//tr//td//a', (text)=>{
      let pollName=text.value.replace(/ /g,'-');
      B.click("//table//tbody//tr//a").useCss()
      .waitForElementVisible('div[class=chartBox]', 500)
      globalObj['pollName']=pollName;
      globalObj['nameWithSpaces']=pollName.replace(/-/g,' ');
      B.assert.urlEquals(basePollURL+pollName);
    });
  },

  /*TODO  add time test for expired & polls that never expire from list, ensuring appropriate tweet text*/

  'displays poll title in tweet': (B) => {
    B.url(basePollURL+globalObj.pollName)
    .waitForElementVisible('div#socialNib',500)
    .execute(function() {
      const tweetHref=document.querySelector('div#socialNib>a').href;
      return {url:tweetHref.split('?url=')[1].split("&text=")[0],
      text:tweetHref.split('?url=')[1].split("&text=")[1].replace(/\%20/g,' ')};
    }, [], function(res) {
      res=res.value;
      let re=new RegExp(`${globalObj.nameWithSpaces}! Vote (.+) with VOTIVE`);
      B.assert.ok(res.url.match(globalObj.pollName)); //TODO an update to tweak on the server
      B.assert.ok(res.text.match(re));
    });
  }
}
