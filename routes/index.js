let express = require('express');
let router = express.Router();

const register = require('../controllers/registerController');
const login = require('../controllers/loginController');
const middleware = require('./middleware');

router.get('/', middleware.checkIfRedirect2Feed, login.getLogin);

router.post('/feed', login.handleLoginButton);

router.get('/feed', login.getFeed);

router.get('/log-out', login.handleLogOut);

router.get('/register', middleware.checkIfRedirect2Feed, register.getRegister);

router.get('/register/password', middleware.checkIfRedirect2Feed, register.getPassword);

router.post('/register/password', register.handleNextButton);

router.post('/register/complete-register', register.handleRegisterButton);

router.get('/register/complete-register', middleware.checkIfRedirect2Feed, login.getLogin);

module.exports = router;
