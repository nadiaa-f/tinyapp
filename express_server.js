const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
const {findUserViaEmail} = require("./helpers.js");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW"
  }
};

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
};

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

const getUserURLs = (user,databaseobj) => {
  let resultURL = {};
  for (const shortURL in databaseobj) {
    if (databaseobj[shortURL].userID === user) {
      resultURL[shortURL] = databaseobj[shortURL];
    }
  }
  return resultURL;
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/register", (req, res) => {
  const templateVars = { display: users[req.session.user_id], urls: urlDatabase }; //Passing the user Object to the _header
  res.render("registration", templateVars);
});

app.get("/login", (req, res) => {
  const templateVars = { display: users[req.session.user_id], urls: urlDatabase };
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
console.log(users);
  const templateVars = { display: users[req.session.user_id], urls: getUserURLs(req.session.user_id,urlDatabase) };
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
  } else {
    res.send('Sorry to access urls you must <a href= "/login"> Login </a>  or  <a href= "/register"> Register </a>');
  }
});

app.get("/urls/new", (req, res) => {
  const templateVars = { display: users[req.session.user_id], urls: urlDatabase }; //Passing the user Object to the _header
  const onlyRegisteredUsers = "urls_new";
  if (!users[req.session.user_id]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  let longURL = urlDatabase[shortURL].longURL;

  const first8 = longURL.substr(0,7);
  const first9 = longURL.substr(0,8);


  if (first8 === "http://" || first9 === "https://") {
    res.redirect(longURL);
  } else {
    longURL = "http://" + longURL;
    res.redirect(longURL);
  }
});

app.get("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const templateVars = { display: users[req.session.user_id], shortURL: req.params.id, longURL: urlDatabase[req.params.id].longURL};
    res.render("urls_show", templateVars);
  } else {
    res.send("Sorry, you cannot access urls that are not under your account!");
  }
});

app.post("/register", (req, res) => {
  let userID = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please try again, your Email and Password fields can't be empty!");
  }
  const user = findUserViaEmail(email);
  if (user) {
    return res.status(400).send("Sorry, a user already exists with that Email, please use a different Email!");
  }
  users[userID] = {id: userID, email: req.body.email, password: /* req.body.password*/ bcrypt.hashSync(req.body.password, 10)};
  req.session.user_id = userID
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let longURLs = req.body.longURL;
  res.send(`Your shortlink: ${shortURL}, Your longlink: ${longURLs}, Your ID: ${req.session.user_id}`);
  urlDatabase[shortURL] = {
    longURL: longURLs,
    userID: req.session.user_id
  };

});

app.post("/urls/:id", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].longURL = req.body.longURL;
    urlDatabase[req.params.id] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.send("Sorry, you cannot edit urls that are not under your account!");
  }
});

app.post("/urls/:id/delete", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    res.send("Sorry, this URL doesn't exist");
    return;
  }
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    delete urlDatabase[req.params.id];
  } else {
    res.send("Sorry, you cannot delete urls that are not under your account!");
  }
  res.redirect("/urls");
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (!email || !password) {
    return res.status(400).send("Please try again, your Email and Password fields can't be empty!");
  }
  const user = findUserViaEmail(email);
  if (!user) {
    return res.status(400).send("Please try again, a user with that Email does not exist!");
  }
  if (/*user.password !==*/!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(400).send('Inncorect! Password does not match');
  }
  req.session.user_id = user.id;
  res.redirect('/urls');
});


app.post("/logout", (req, res) => {
  delete req.session.user_id;
  res.redirect("/urls");
});
