const User = require("../models");
const bcrypt = require("bcrypt");
const errorMsg = require('./includes/errorMsgs').errorMsg;

/** This function serves the login page and renders it with a message
 *  from the request query, if no message is found, it renders the login
 *  page with a default message.*/
exports.getLogin = (req, res) => {

    const message = req.query.message || errorMsg.noError;
    res.render('login',{errormessage: message});
};

/** This function serves the feed page and renders it with the user's information
 *  if they are logged in, otherwise redirects the user to the home page.*/
exports.getFeed = (req, res) => {

    if(req.session.email)
        res.render('feed', {userName: req.session.userName, email: req.session.email});
    else
        res.redirect('/');
};

/** This function logs the user out by destroying the session and
 *  redirecting them to the home page.*/
exports.handleLogOut = (req, res) => {
    req.session.destroy();
    res.redirect('/');
};

/** This middleware checks if a user is already registered by checking their email,
 *  if the user is registered, it proceeds to the next middleware, otherwise,
 *  it renders an error message.*/
function checkIfUserExistMiddleware(req, res, next) {

    let { email } = req.body;
    email = email.trim().toLowerCase();

    User.userInfo.findOne({
        where: {email: email}
    }).then(user => {
        if (user) {
            req.user = user;
            return next();
        }
        return res.render('login',{errormessage: errorMsg.incorrectEmail});
    }).catch(error => {
        res.render('login',{errormessage: error.message});
    });
}

/** This function signs in the user by comparing the password from the request
 *  body with the hashed password from the user object, if they match it sets
 *  session's email and userName, otherwise it renders an error message.*/
function signIn(req, res) {

    const user = req.user;
    let { email, password } = req.body;
    email = email.trim().toLowerCase();

    bcrypt.compare(password, user.password)
        .then(same => {
            if(same) {
                req.session.email = email;
                req.session.userName = user.firstName + " " + user.lastName;
                res.render('feed', {userName: req.session.userName, email: req.session.email});
            }
            else
                res.render('login',{errormessage: errorMsg.incorrectPassword});
        })
        .catch((error) => {
            res.render('login',{errormessage: error.message});
        })
}

exports.handleLoginButton = [checkIfUserExistMiddleware, signIn];


