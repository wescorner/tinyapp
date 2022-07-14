const { assert } = require("chai");
const { findUserByEmail, urlsForUser } = require("../helpers.js");

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

const testURLS = {
  testID: {
    longURL: "http://www.example.com",
    userID: "userID",
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

describe("urlsForUser", function () {
  it("should return a URL for valid user id", function () {
    const url = urlsForUser("userID", testURLS).testID.longURL;
    const expectedURL = "http://www.example.com";
    assert.equal(expectedURL, url);
  });
});
