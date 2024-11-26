'use strict';
const {Model} = require('sequelize');
const errorMsg = require('./includes/errorMsgs').errorMsg;

/** This exports a Sequelize model 'userInfo' which represents a user
 *  and defines associations, schema, and validation rules for the
 *  properties and sets the unique property for the email property.*/
module.exports = (sequelize, DataTypes) => {
  class userInfo extends Model {
    /**
     * defining associations.
     */
    static associate(models) {
      userInfo.hasMany(sequelize.models.Comments,{foreignKey: 'userId'});
    }
  }
  userInfo.init({
    email: {
      type: DataTypes.STRING,
      unique: true,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missEmail
        },
        isEmail: {
          args: true,
          msg: errorMsg.invalidEmail
        },
        len: {
          args: [3, 32],
          msg: errorMsg.emailLen
        }
      }
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missFirstName
        },
        is: {
          args: /^[a-zA-Z]+$/,
          msg: errorMsg.firstNameFormat
        },
        isLowercase: {
          args: true,
          msg: errorMsg.firstNameLowercase
        },
        len: {
          args: [3, 32],
          msg: errorMsg.firstNameLen
        }
      }
    },
    lastName:  {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missLastName
        },
        is: {
          args: /^[a-zA-Z]+$/,
          msg: errorMsg.lastNameFormat
        },
        isLowercase: {
          args: true,
          msg: errorMsg.lastNameLowercase
        },
        len: {
          args: [3, 32],
          msg: errorMsg.lastNameLen
        }
      }
    },
    password: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missPassword
        },
        // check if password is encrypted
        len: {
          args: [60, 60],
          msg: errorMsg.encryptedPassword
        }
      }
    }
  }, {
    sequelize,
    modelName: 'userInfo',
  });

  return userInfo;
};