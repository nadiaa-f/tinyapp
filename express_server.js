const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
};

const findUserViaEmail = (email) => {
  for(const userId in users) {
    const user = users[userId];
    if(user.email === email) {
      return user;
    }
  }
  return null;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { display: users[req.cookies.user_id], urls: urlDatabase }; //Passing the user Object to the _header
  res.render("registration", templateVars);
}); 

app.get("/login", (req, res) => {
  const templateVars = { display: users[req.cookies.user_id], urls: urlDatabase };
  res.render("login", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { display: users[req.cookies.user_id], urls: urlDatabase }; //Passing the user Object to the _header
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { display: users[req.cookies.user_id], urls: urlDatabase }; //Passing the user Object to the _header
  res.render("urls_new", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { display: users[req.cookies.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}; //Passing the user Object to the _header
  console.log(templateVars);
  res.render("urls_show", templateVars);
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please try again, your Email and Password fields can't be empty!");
  }
  const user = findUserViaEmail(email);
  if(user) {
    return res.status(400).send("Sorry, a user already exists with that Email, please use a different Email!")
  }
  users[userID] = {id: userID, email: req.body.email, password: req.body.password};
  res.cookie("user_id", userID); 
  res.redirect("urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  console.log(urlDatabase);  // Log the POST request body to the console
  res.redirect(req.body.longURL);  // sends to a new page
});

app.post("/urls/:shortURL", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please try again, your Email and Password fields can't be empty!");
  }
  const user = findUserViaEmail(email);
  if(!user){
    return res.status(400).send("Please try again, a user with that Email does not exist!")
  }
  if(user.password !== password) {
    return res.status(400).send('Inncorect! Password does not match')
  }
  res.cookie('user_id', user.id);
  res.redirect('/urls')
});


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});
