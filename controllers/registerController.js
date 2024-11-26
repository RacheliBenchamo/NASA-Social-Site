const User = require('../models');
const Cookies = require('cookies');
const Sequelize = require("sequelize");
const errorMsg = require('./includes/errorMsgs').errorMsg;
const bcrypt = require("bcrypt")

const saltRounds = 10
const keys = ['keyboard cat']
const emptyUserInfo = {email:"", firstName:"", lastName: ""};

/** This function serves the registration page and populates it with user
 *  information from a cookie if it exists,otherwise it serves an empty registration page.*/
exports.getRegister = (req, res) =>{

    let data = getCookie(req, res);

    if (data) {
        data = data.split('/');
        res.render('register', {errormessage: errorMsg.noError,
            userInfo: {email:data[0], firstName:data[1], lastName: data[2]}});
    }
    else {
        res.render('register', {errormessage: errorMsg.noError, userInfo: emptyUserInfo});
    }
}

/** This function serves either password or registration page,
 *  depending on the existence of a cookie on the user's browser.*/
exports.getPassword = (req, res) =>{

    let data = getCookie(req, res);

    if(data)
        res.render('password', {errormessage: errorMsg.noError});
    else
        res.render('register',{errormessage: errorMsg.noError, userInfo: emptyUserInfo});
}

/** This function handles the next button on the registration page, it checks if the email
 *  is already registered and either sets a cookie and redirects to password page or
 *  renders the registration page with an error message. */
exports.handleNextButton = (req, res) => {

    let { email, first_name, last_name } = req.body;
    [email, first_name, last_name] = [email, first_name, last_name].map(str => str.trim().toLowerCase());
    let str = email + "/" + first_name + "/" + last_name;

    User.userInfo.findOne({
        where: {email: email}
    }) .then(prod => {
        if(prod)
            res.render('register', {errormessage: errorMsg.registeredEmail,
                userInfo: {email: email, firstName: first_name, lastName: last_name}});
        else{
            const cookies = new Cookies(req, res, { keys: keys });
            cookies.set('userInfo', str, {signed: false, maxAge: 30 * 1000});
            res.render('password', {errormessage: errorMsg.noError});
        }
    }).catch((error) => {
        res.render('register', {errormessage: error.message,
        userInfo: {email: email, firstName: first_name, lastName: last_name}});
    })
}

/** This middleware checks if the password and confirm password match in the
 *  request body, if they don't match, it renders an error message, otherwise
 *  it proceeds to the next middleware.*/
function checkPasswordsMiddleware(req, res, next) {

    const { password, confirmPassword } = req.body;

    if(password !== confirmPassword)
        res.render('password', {errormessage: errorMsg.noMatch}).send()
    else next();
}

/** This middleware checks if a user is already registered, if not, it proceeds
 *  to the next middleware, otherwise, it renders an error message. */
function checkIfUserExistMiddleware(req, res, next) {

    let data = getCookie(req, res);
    if(!data)
        res.render('register', {errormessage: errorMsg.expiredRegistration, userInfo: emptyUserInfo}).send();

    data = data.split('/');
    User.userInfo.findOne({
        where: {email: data[0].toLowerCase()}
    }).then(user => {
            if (!user) {
                return next();
            }
            return res.render('register', { errormessage: errorMsg.failedRegistration });
        })
        .catch(error => {
            return res.render('password', { errormessage: error });
        });
}

/** This middleware inserts a new user into the database using the information
 *  from the request body and cookie, handling any errors by rendering the
 *  password page with the error message.*/
function createNewUserMiddleware(req, res) {

    const { password } = req.body;
    const data = getCookie(req, res).split('/');

    bcrypt.genSalt(saltRounds)
        .then(salt => {
            return bcrypt.hash(password, salt)
        })
        .then(hash => {
            insert2DataBase(res, data, hash);
        })
        .catch((error) => {
            return res.render('password', { errormessage: error });
        });
}

/** This function inserts a new user into the database, clears the cookies,
 *  and renders the login page with a message indicating successful registration.
 *  It also handles errors by rendering the password page with the error message.*/
const insert2DataBase = (res, data, password) =>{

    let u = User.userInfo.build({email: data[0], firstName: data[1], lastName: data[2], password: password});
    return u.save()
        .then(() => {
            res.clearCookie("userInfo");
            res.render('login', {errormessage: errorMsg.successRegistration})
        })
        .catch((error) => {
            if (error instanceof Sequelize.ValidationError) {
                let customErrorMessage = error.errors.map(e => e.message).join(" ")
                res.render('password', {errormessage: customErrorMessage});
            } else
                res.render('password', {errormessage: error});
        })
}

/** This function retrieves the userInfo cookie from the request.*/
const getCookie = (req, res) =>{

    const cookies = new Cookies(req, res, { keys: keys });
    return cookies.get('userInfo');
}

exports.handleRegisterButton = [checkPasswordsMiddleware, checkIfUserExistMiddleware, createNewUserMiddleware];



