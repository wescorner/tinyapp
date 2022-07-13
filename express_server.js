const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "userRandomID",
  },
};

const users = {
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

const generateRandomString = function () {
  let result = "";
  let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456879";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const findUserByEmail = function (email) {
  for (const i in users) {
    if (email === users[i].email) {
      return users[i];
    }
  }
  return null;
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

/*
  !-------------------------------------------------------------------------------------------!  
  TODO: install cookie-session middleware
  TODO: switch to encrypted cookies
  TODO: refactor helper functions for testing
  TODO: write mocha test cases for helper functions
  TODO: install method-override
  TODO: use method-override to modify relevent routes to PUT or DELETE
  TODO: keep track of how many times a given shortURL is visited and display it
  TODO: keep track of how many unique visitors visit each url and display with total visitors
  TODO: keep track of every visit and display list on URL edit page
  TODO: clean up css and styling
  ? Think of new features/libraries to possibly add
  !-------------------------------------------------------------------------------------------!
  */

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.cookies["user_id"]),
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Must be logged in to add new URL's");
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.cookies["user_id"],
  };
  res.redirect(`/urls/${id}`);
});

app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("This URL ID does not exist!");
  }
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Must be logged in to view URL's");
  }
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Cannot view URL's that are not yours");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("This URL ID does not exist");
  }
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Must be logged in to delete URLs");
  }
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Can only delete URLs that you own");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("This URL ID does not exist");
  }
  if (!req.cookies["user_id"]) {
    return res.status(400).send("Must be logged in to edit URLs");
  }
  if (req.cookies["user_id"] !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Can only edit URLs that you own");
  }
  urlDatabase[req.params.id].longURL = req.body.id;
  res.redirect(`/urls/${req.params.id}`);
});

app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (user === null) {
    return res.status(403).send("User not found");
  }

  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Incorrect password");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  if (req.cookies["user_id"]) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.cookies["user_id"]] };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email.length === 0 || req.body.password.length === 0) {
    return res.status(400).send("Invalid Email or Password");
  }
  if (findUserByEmail(email) !== null) {
    return res.status(400).send("User already exists");
  }
  users[id] = { id, email, password };
  res.cookie("user_id", id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
