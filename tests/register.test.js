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

const rando=randomName();

module.exports = {
  '@disabled': false,
  before(B) { B.execute(function(){sessionStorage.clear();})},
  after(B) { B.end(); },

  'click register button and register form appears': (B) => {
    B.url(baseURL)
    .click(register)
    .assert.urlEquals(registerURL)
  },

  'register form contains helpful and clever input labels': (B) => {
    B.url(registerURL)
    .useXpath()
    .getText('(//label)[1]', (text)=>{
      B.assert.equal(text.value,"make a name for yourself");
    })
    .getText('(//label)[2]', (text)=>{
      B.assert.equal(text.value,"password");
    })
  },

  'cannot register with empty fields': (B) => {
    B.url(registerURL).useCss()
    .click(submit)
    .assert.urlEquals(registerURL);
  },

  'cannot register without a username': (B) => {
    B.url(registerURL).useCss()
    .setValue(pass,'meh')
    .click(submit)
    .assert.urlEquals(registerURL);
  },

  'cannot register without a password': (B) => {
    B.url(registerURL)
    .setValue(user,'meh')
    .click(submit)
    .assert.urlEquals(registerURL);
  },

  'cannot have special characters in username': (B) => {
    B.url(registerURL)
    .setValue(user,'!meh')
    .setValue(pass,'meh')
    .click(submit)
    .waitForElementVisible('div#warning',100)
    .assert.urlEquals(registerURL)
    .getText('div#warning', (text)=>{
      B.assert.equal(text.value, 'Sorry, your username cannot have special characters.');
    });
  },

  'CAN have special characters in password': (B) => {
    B.url(registerURL)
    .setValue(user,rando)
    .setValue(pass,'!meh')
    .click(submit)
    .pause(300)
    .assert.urlEquals(loginURL);
  },

  'cannot register same user twice': (B) => {
    B.url(registerURL)
    .setValue(user,rando)
    .setValue(pass,'!meh')
    .click(submit)
    .waitForElementVisible('div#warning',100)
    .assert.urlEquals(registerURL)
    .getText('div#warning', (text)=> {
      B.assert.equal(text.value, 'Sorry, that name is taken. Try again?');
    });
  }
}
