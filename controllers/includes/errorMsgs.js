/** This exports an object that contains error messages for different scenarios in
 *  the application, these messages are used to provide feedback to the user.*/
exports.errorMsg = {

    noError: "",
    registeredEmail: "This email is already in use. please choose another one.",
    noMatch: "passwords do not match. try again!",
    successRegistration: "Registration successful. you can now login",
    failedRegistration: "Registration failed. email already exist",
    expiredRegistration: "Registration expired. please start again",
    failedGetComment: "Error in getting the comments of the day: ",
    failedDeleteComment: "Error deleting comment: ",
    failedDeleteNonExistComment: "Comment already deleted",
    failedGetChanges: "Error in getting the comments of the changed days: ",
    incorrectPassword: "Sorry, your password was incorrect. Please double-check your password.",
    incorrectEmail: "Sorry, your email address was incorrect. Please double-check your email address."
}