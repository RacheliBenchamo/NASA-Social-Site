let createError = require('http-errors');
let fs = require('fs')
const nocache = require("nocache");

let path = require('path');
let logger = require('morgan');
const express = require('express');

const bodyParser = require('body-parser');
let cookieParser = require('cookie-parser');

let feedRouter = require('./routes/feed');
let indexRouter = require('./routes/index');

let app = express();

// view engine setup: add EJS folder
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(nocache());

// enable parsing request data
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// enable database session store
let Sequelize = require('sequelize')
let session = require('express-session');
let SequelizeStore = require('connect-session-sequelize')(session.Store);

let sequelize = new Sequelize({
  "dialect": "sqlite",
  "storage": "./session.sqlite"
});


let myStore = new SequelizeStore({
  db: sequelize
})


// enable sessions
app.use(session({
  secret:"somesecretkey",
  resave: false, // Force save of session for each request
  saveUninitialized: false, // Save a session that is new, but has not been modified
  cookie: {maxAge: 10*60*1000 } // milliseconds!
}));

app.use('/', indexRouter);
app.use('/feed', feedRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;