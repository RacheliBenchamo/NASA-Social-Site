/** This exports an object that contains error messages for different scenarios in
 *  the application, these messages are used to provide feedback to the user.*/
exports.errorMsg = {

    missUserId: "userId is required.",
    missComment: "Comment is required.",
    missDate: "Date is required.",
    missEmail: "Email is required.",
    missFirstName: "First name is required.",
    missLastName: "Last name is required.",
    missPassword: "Password is required.",
    maxComment: "Comment must be less than 128 characters.",
    invalidDate: "Invalid date format, it should be YYYY-MM-DD.",
    invalidEmail: "Invalid email format.",
    emailLen: "Email must be between 3 and 32 characters.",
    firstNameFormat: "First name can only contain letters.",
    firstNameLowercase: "First name must be lowercase.",
    firstNameLen: "First name must be between 3 and 32 characters.",
    lastNameFormat: "Last name can only contain letters.",
    lastNameLowercase: "Last name must be lowercase.",
    lastNameLen: "Last name must be between 3 and 32 characters.",
    encryptedPassword: "Password must be encrypted."
}