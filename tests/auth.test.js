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

  'open the browser': (B) => {
    B.url(baseURL)
    .assert.title('votive')
    .assert.containsText('div[id=header]','VOTIVE');
  },

  'does not submit without values entered': (B) => {
    B.url(loginURL)
    .click(submit)
    .assert.urlEquals(loginURL);
  },

  'does not submit with missing fields': (B) => {
    B.url(loginURL)
    .setValue(user,'a')
    .click(submit)
    .assert.urlEquals(loginURL, 'username but no pwd')
    .clearValue(user)
    .setValue(pass,'a')
    .click(submit)
    .assert.urlEquals(loginURL, 'pwd but no username');
  },

  'does not submit with invalid fields': (B) => {
    B.url(loginURL)
    .setValue(user,'a')
    .setValue(pass,'b')
    .click(submit)
    .assert.urlEquals(loginURL, 'invalid pwd');
  },

  'loads registration page': (B) => {
    B.url(loginURL)
    .click('xpath',"//button[text()='REGISTER']")
    .assert.urlEquals(registerURL, 'page loads fine');
  },

  'does not register with missing fields': (B) => {
    B.url(registerURL)
    .setValue(user,'a').click(submit)
    .assert.urlEquals(registerURL, 'username but no pwd')
    .setValue(user,'mdsmgdm').setValue(pass,'a').click(submit)
    .assert.urlEquals(registerURL, 'pwd but no username');
  },

  'does not register an existing user': (B) => {
    B.url(registerURL)
    .setValue(user,'a').setValue(pass,'a').click(submit)
    .waitForElementVisible('div[id=warning]', 300)
    .getText('div[id=warning]', (text)=>{
      B.assert.equal(text.value,'Sorry, that name is taken. Try again?');
    });
  },

  'registers a new user, logs out new user': (B) => {
    const newUser=randomName();
    B.url(registerURL)
    .setValue(user,newUser).setValue(pass,'Z').click(submit)
    .waitForElementVisible('div[id=loginBox]', 300)
    .assert.urlEquals(loginURL, 'registering a valid user returns to login page');
    B.execute(function() {
      return document.querySelector('input[name=username]').value;
    },function(data) {
      B.assert.equal(data.value,newUser);
    });
    B.clearValue(pass).setValue(pass,'q').click(submit)
    .waitForElementVisible('div[id=warning]', 300)
    .getText('div[id=warning]', (text) => {
      B.assert.equal(text.value,'Invalid, sorry. Try again?')
    });
    B.clearValue(pass).setValue(pass,'Z').click(submit)
    .waitForElementVisible('div[id=greeting]', 300)
    .getText('div[id=greeting]', (text) => {
      B.assert.equal(text.value, `>> ${newUser} [logout]`)
    })
    .assert.urlEquals(dashURL, 'valid login takes user to the dash')
    .useXpath()
    .getText('//div[@id="warning"]', (text) => {
      B.assert.equal(text.value, 'You have no polls available.\nWhy not make one now?');
    })
    //logs out user
    .click('//a[contains(text(), "logout")]')
    .waitForElementVisible('//div[@class="pageBox"]', 2000)
    .getText('//div[@class="pageBox"]', (text) => {
      B.assert.equal(text.value, 'Thank you for stopping by!');
    })
    .waitForElementVisible('//div[@id="loginBox"]',2000)
    .assert.urlEquals(loginURL, 'takes user back to login page after logout');
  }
}
