'use strict';
const { Model } = require('sequelize');
const errorMsg = require('./includes/errorMsgs').errorMsg;

/** This exports a Sequelize model 'Comments' representing a comment and
 *  associated with 'userInfo' model, sets validation rules and paranoid
 *  property for the comment object.*/
module.exports = (sequelize, DataTypes) => {
  class Comments extends Model {
    /**
     * defining associations.
     */
    static associate(models) {
      Comments.belongsTo(sequelize.models.userInfo,{foreignKey: 'userId'});
    }
  }
  Comments.init({
    userId: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missUserId
        },
      }
    },
    comment: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missComment
        },
        max: {
          args: 128,
          msg: errorMsg.maxComment
        }
      }
    },
    date:{
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: errorMsg.missDate
        },
        is: {
          args: /^\d{4}-(0?[1-9]|1[012])-(0?[1-9]|[12][0-9]|3[01])$/,
          msg: errorMsg.invalidDate
        },
      }
    }
  }, {
    sequelize,
    paranoid: true,

    deletedAt: 'destroyTime',
    modelName: 'Comments',
  });

  return Comments;
};