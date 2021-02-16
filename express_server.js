const express = require("express");
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
  const rand = Math.random().toString(16).substr(2, 6);
  return rand;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // console.log(req.params);
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  // console.log(longURL);
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  const templateVars = { shortURL: generateRandomString(), longURL: req.body.longURL };
  urlDatabase[templateVars.shortURL] = templateVars.longURL;
  console.log(req.body);  // Log the POST request body to the console
  res.redirect(`/urls/${templateVars.shortURL}`);         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  // const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  // const idToDelete = req.params.id;
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});