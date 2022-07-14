const generateRandomString = function () {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456879";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const findUserByEmail = function (email, database) {
  for (const i in database) {
    if (email === database[i].email) {
      return database[i];
    }
  }
  return undefined;
};

const urlsForUser = function (id) {
  const result = {};
  for (const i in urlDatabase) {
    if (id === urlDatabase[i].userID) {
      result[i] = urlDatabase[i];
    }
  }
  return result;
};

module.exports = { generateRandomString, findUserByEmail, urlsForUser };
