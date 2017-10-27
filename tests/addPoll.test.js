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
  before(B) { B.execute(function(){sessionStorage.clear();})
  B.url(loginURL)
  .setValue(user,'a').setValue(pass,'a')
  .click(submit)
  .waitForElementVisible('table[class=mui-table]',400)
  },
  after(B) { B.end(); },

  'cannot create a poll without a title': (B) => {
    B.url(addPollURL)
    .waitForElementVisible('div[id=pollBox]',400)
    .setValue(choices,'meh\nmover\nbiggun')
    .click(submit)
    .assert.urlEquals(addPollURL);
  },

  'creating a poll with a title and choices takes you to the page upon creation': (B) => {
    B.url(addPollURL)
    .waitForElementVisible('div[id=pollBox]',400)
    .setValue(pollName,rando)
    .setValue(choices,'meh\nmover\nbiggun')
    .click(submit)
    .waitForElementVisible('div[class=chartBox]',400)
    .assert.urlEquals(basePollURL+rando);
  },

  'creating a poll with an existing name hyphenates and increments by 1': (B) => {
    B.url(addPollURL)
    .waitForElementVisible('div[id=pollBox]',400)
    .setValue(pollName,rando)
    .setValue(choices,'meh\nmover\nbiggun')
    .click(submit)
    .waitForElementVisible('div[class=chartBox]',400)
    .assert.urlEquals(basePollURL+rando+"-1");
  },

  'the poll appears on the user dashboard': (B) => {
    B.url(dashURL)
    .waitForElementVisible('table#pollT',400)
    .useXpath()
    .click('//a[@id="createdOn"]')
    .click('//a[@id="createdOn"]')
    .getText('(//table[@id="pollT"]//tbody//tr//td[@id="title"])[1]', function(T) {
      B.assert.equal(T.value,rando+" 1");
    });
  },

  'the poll appears on the main poll list first': (B) => {
    B.url(listURL).pause(1000)
    .useXpath()
    .click('//a[@id="createdOn"]')
    .click('//a[@id="createdOn"]')
    .getText('(//table[@id="pollT"]//tbody//tr//td[@id="title"])[1]', function(T) {
      B.assert.equal(T.value,rando+" 1");
    });
  }
}
