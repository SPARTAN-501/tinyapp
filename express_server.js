const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
const getUserByEmail = require("./helpers.js");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// Generate a random string
const generateRandomString = function() {
  const rand = Math.random().toString(16).substr(2, 6);
  return rand;
};

// Helper function
const urlsForUser = function(id) {
  let newDatabase = {};
  const shortKeys = Object.keys(urlDatabase);
  for (let i = 0; i < shortKeys.length; i++) {
    if (urlDatabase[shortKeys[i]].userID === id) {
      newDatabase[shortKeys[i]] = urlDatabase[shortKeys[i]];
    }
  }
  return newDatabase;
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  }
  else {
    const templateVars = {
      user_id: req.session.user_id,
      // ... any other vars
    };
    res.render("urls_new", templateVars);
  }
});

// URLs index
app.get("/urls", (req, res) => {
  if (req.session.user_id === undefined) {
    res.redirect("/login");
  }
  else {
    const templateVars = { urls: urlDatabase, user_id: req.session.user_id };
    const userID = templateVars.user_id.id;
    const userDatabase = urlsForUser(userID);
    const newTemplateVars = { urls: userDatabase, user_id: req.session.user_id };
    res.render("urls_index", newTemplateVars);
  }
});

// Show URLs
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.session.user_id };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Registration page
app.get("/register", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session.user_id };
  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session.user_id };
  res.render("login", templateVars);
});

// Add URL
app.post("/urls", (req, res) => {
  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL, user_id: req.session.user_id };
  const shortURL = templateVars.shortURL;
  urlDatabase[shortURL] = { longURL: templateVars.longURL, userID: templateVars.user_id.id };
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${templateVars.shortURL}`);         // Respond with 'Ok' (we will replace this)
});

// Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.session.user_id };
  const userID = templateVars.user_id.id;
  const shortURL = templateVars.shortURL;
  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

// Edit URL
app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const newLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

// Login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (bcrypt.compareSync(password, user.password) === true) {
    req.session.user_id = user;
    const templateVars = {
      user_id: req.session.user_id,
      // ... any other vars
    };
    res.redirect("/urls");
  }
  else {
    res.status(403);
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const id = generateRandomString();
  let email = req.body.email;
  let password = bcrypt.hashSync(req.body.password, 10);
  const user = {
    id: id,
    email: email,
    password: password
  }
  if (email === "" || password === "") {
    res.status(400);
  }
  else if (getUserByEmail(email, users).email === user.email) {
    res.status(400);
  }
  else {
    users[id] = user;
    req.session.user_id = user;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}