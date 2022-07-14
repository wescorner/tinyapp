const { assert } = require("chai");
const { findUserByEmail } = require("../helpers.js");

const testUsers = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

describe("findUserByEmail", function () {
  it("should return a user with valid email", function () {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(expectedUserID, user.id);
  });
  it("should return undefined for an email that doesn't exist", function () {
    const user = findUserByEmail("test@example.com", testUsers);
    assert.isUndefined(user);
  });
});
