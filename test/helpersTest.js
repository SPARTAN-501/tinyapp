const { assert } = require('chai');

const users = require("../express_server.js")
const getUserByEmail = require('../helpers.js');
const bcrypt = require('bcrypt');

const testUsers = {
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", users)
    const expectedOutput = "userRandomID";
    // Write your assert statement here
    assert(user.id === expectedOutput);
  });

  it('should return undefined', function () {
    const user = getUserByEmail("tony.stark@starkindustries.com", users);
    // console.log(user);
    const expectedOutput = undefined;
    assert(user.id === undefined);
  });

  it('should return true', function () {
    const user = getUserByEmail("user@example.com", users);
    const expectedOutput = true;
    assert(bcrypt.compareSync("purple-monkey-dinosaur", user.password), true);
  })
});