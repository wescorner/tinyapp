/*
  !-------------------------------------------------------------------------------------------!  
  TODO: npm morgan
  TODO: keep track of how many times a given shortURL is visited and display it
  TODO: keep track of how many unique visitors visit each url and display with total visitors
  TODO: keep track of every visit and display list on URL edit page
  TODO: use alerts instead of res.send() for displaying error messages
  TODO: add sanitization to user's email and password
  TODO: re-test ALL functionality
  TODO: clean up css and styling
  ? Think of new features/libraries to possibly add
  !-------------------------------------------------------------------------------------------!
  */
const express = require("express");
const cookieSession = require("cookie-session");
const bcrypt = require("bcryptjs");
const methodOverride = require("method-override");
const {
  generateRandomString,
  findUserByEmail,
  urlsForUser,
} = require("./helpers");

const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

//*MIDDLEWARE
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(
  cookieSession({
    name: "user_id",
    keys: ["secret"],
    maxAge: 24 * 60 * 60 * 1000,
  })
);

//*GLOBAL VARIABLES
const urlDatabase = {};
const users = {};

//*ROUTES
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//Show all URLs
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlsForUser(req.session.user_id, urlDatabase),
    user: users[req.session.user_id],
  };
  res.render("urls_index", templateVars);
});

//Add new URL
app.post("/urls", (req, res) => {
  if (!req.session.user_id) {
    return res.status(400).send("Must be logged in to add new URL's");
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: req.session.user_id,
    totalVisits: 0,
    uniqueVisitors: 0,
  };
  res.redirect(`/urls/${id}`);
});

//Show form for adding new URL
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    return res.redirect("/login");
  }
  const templateVars = {
    user: users[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Show single URL by ID
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send("This URL ID does not exist!");
  }
  if (!req.session.user_id) {
    return res.status(400).send("Must be logged in to view URL's");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Cannot view URL's that are not yours");
  }
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
    totalVisits: urlDatabase[req.params.id].totalVisits,
    uniqueVisitors: urlDatabase[req.params.id].uniqueVisitors,
  };
  res.render("urls_show", templateVars);
});

//Delete single URL by ID
app.delete("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("This URL ID does not exist");
  }
  if (!req.session.user_id) {
    return res.status(400).send("Must be logged in to delete URLs");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Can only delete URLs that you own");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});

//Update single URL by ID
app.put("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(400).send("This URL ID does not exist");
  }
  if (!req.session.user_id) {
    return res.status(400).send("Must be logged in to edit URLs");
  }
  if (req.session.user_id !== urlDatabase[req.params.id].userID) {
    return res.status(400).send("Can only edit URLs that you own");
  }
  urlDatabase[req.params.id].longURL = req.body.id;
  res.redirect(`/urls/${req.params.id}`);
});

//Redirect short URL to long URL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id].longURL;
  urlDatabase[req.params.id].totalVisits++;
  // if (
  //   !urlDatabase[req.params.id].uniqueVisitors.includes(req.session.user_id)
  // ) {
  //   //if the current session cookie is not in the uniqueVisitors array for this tinyURL, push it
  //   urlDatabase[req.params.id].uniqueVisitors.push(req.session.user_id);
  // }
  console.log(urlDatabase[req.params.id]);
  res.redirect(longURL);
});

//Show form for Login
app.get("/login", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("login", templateVars);
});

//Login via email and password
app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email, users);
  if (!user) {
    return res.status(403).send("User not found");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Incorrect password");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//Logout current user
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Show form for registering new user
app.get("/register", (req, res) => {
  if (req.session.user_id) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[req.session.user_id] };
  res.render("register", templateVars);
});

//Register with email and password
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = bcrypt.hashSync(req.body.password, 10);
  if (email.length === 0 || req.body.password.length === 0) {
    return res.status(400).send("Invalid Email or Password");
  }
  if (findUserByEmail(email, users)) {
    return res.status(400).send("User already exists");
  }
  users[id] = { id, email, password };
  req.session.user_id = id;
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`TinyApp listening on port ${PORT}!`);
});
