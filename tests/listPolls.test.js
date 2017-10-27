//TODO resize screen with selenium and test number of cols present
//No delete col present when not logged in
//Delete col present when logged in on user dash

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

module.exports = {
  '@disabled': false,
  before(B) { B.execute(function(){sessionStorage.clear();})},
  after(B) { B.end(); },

  //poll list

  'open list page and check all columns visible at width>=500px': (B) => {
    B.url(listURL)
    .resizeWindow(500,600)
    .useXpath()
    .waitForElementVisible('//table[@id="pollT"]',1000)
    .execute(function(data){
      var header=document.querySelectorAll('table#pollT>thead>tr>th');
      return JSON.stringify(Object.keys(header).map(k=>header[k].textContent));
    }, [], function(result) {
      B.assert.equal(result.value, '["Title ","User ","Votes ","Visits ","Age ","Ends? ⇑"]')
    });
  },

  'only two columns visible at width<500 px': (B) => {
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
  }

  //dashboard


  //pagination

}
