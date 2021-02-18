const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const password = "purple-monkey-dinosaur"; // found in the req.params object
const hashedPassword = bcrypt.hashSync(password, 10);
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
  const rand = Math.random().toString(16).substr(2, 6);
  return rand;
}

function findEmail(email) {
  const userList = Object.keys(users);
  for (let i = 0; i < userList.length; i++) {
    if (users[userList[i]].email === email) {
      return true;
    }
  }
  return false;
}

function findPassword(email, password) {
  const userList = Object.keys(users);
  for (let i = 0; i < userList.length; i++) {
    if (users[userList[i]].email === email && (bcrypt.compareSync(password, users[userList[i]].password) === true)) {
      return users[userList[i]].id;
    }
  }
  return false;
}

function urlsForUser(id) {
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
  // res.send("<html><body>Hello <b>World</b></body></html>\n");
  const templateVars = { greeting: 'Hello World!' };
  res.render("hello_world", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  }
  else {
    const templateVars = {
      user_id: req.cookies["user_id"],
      // ... any other vars
    };
    res.render("urls_new", templateVars);
  }
});

app.get("/urls", (req, res) => {
  if (req.cookies["user_id"] === undefined) {
    res.redirect("/login");
  }
  else {
    const templateVars = { urls: urlDatabase, user_id: req.cookies["user_id"] };
    const userID = templateVars.user_id.id;
    const userDatabase = urlsForUser(userID);
    const newTemplateVars = { urls: userDatabase, user_id: req.cookies["user_id"] };
    // console.log(templateVars);
    res.render("urls_index", newTemplateVars);
  }
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user_id: req.cookies["user_id"] };
  // console.log(req.params);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  // console.log(longURL);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"] };
  res.render("register", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"] };
  res.render("login", templateVars);
});

app.post("/urls", (req, res) => {
  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL, user_id: req.cookies["user_id"] };
  const shortURL = templateVars.shortURL;
  urlDatabase[shortURL] = { longURL: templateVars.longURL, userID: templateVars.user_id.id };
  // console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${templateVars.shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user_id: req.cookies["user_id"] };
  // const idToDelete = req.params.id;
  const userID = templateVars.user_id.id;
  const shortURL = templateVars.shortURL;
  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  // console.log(shortURL);
  const newLongURL = req.body.longURL;
  // console.log(newLongURL);
  urlDatabase[shortURL].longURL = newLongURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let user = {};
  let userID = "";
  if (findEmail(email) === true && findPassword(email, password) !== false) {
    userID = findPassword(email, password);
    user = users[userID];
    res.cookie("user_id", user);
    const templateVars = {
      user_id: req.cookies["user_id"],
      // ... any other vars
    };
    res.redirect("/urls");
    // res.render("urls_index", templateVars);
  }
  else {
    res.status(403);
  }
});

app.post("/logout", (req, res) => {
  // console.log(req.cookies);
  res.clearCookie("user_id");
  delete req.cookies["user_id"];
  res.redirect("/urls");
});

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
    console.log(users);
  }
  else if (findEmail(email) === true) {
    res.status(400);
    console.log(users);
  }
  else {
    users[id] = user;
    res.cookie("user_id", user);
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
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}