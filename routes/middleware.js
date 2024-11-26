
/** Checks if a session exists, if yes it redirects to the feed page,
 *  otherwise it calls the next middleware.*/
exports.checkIfRedirect2Feed = (req, res, next) => {

    if(req.session.email)
        res.redirect('/feed');
    else
        next();
}

/** Checks if a session exists, if yes it proceeds to the next middleware,
 *  otherwise it sets a header "session-valid" to "false" and ends the response.*/
exports.checkSession = (req, res, next) => {

    if(req.session.email) {
        next();
    }
    else{
        console.log("disconnect");
        res.setHeader("session-valid", "false");
        res.end();
    }
}