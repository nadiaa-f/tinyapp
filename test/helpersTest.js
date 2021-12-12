const { assert } = require('chai');

const { findUserViaEmail } = require('../helpers.js');

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

describe('findUserViaEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserViaEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.deepEqual(user.id, expectedUserID);
  });

  it('should return undefined if a users email does not exist', function() {
    assert.equal(findUserViaEmail(testUsers, 'user3@example.com'), undefined);
  });

});