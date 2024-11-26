const model = require("../models");
const Sequelize = require("sequelize");
const errorMsg = require('./includes/errorMsgs').errorMsg;

/** This function retrieves comments that were made on a specific
 * date and sends them as a JSON object, it also handles errors
 * by sending an error message.*/
exports.getCommentsByDate = (req, res) => {

    const date = req.params.date;
    let result = [];

    model.Comments.findAll({
        where: { date: date.toString()},
        include: [{
            model: model.userInfo,
            attributes: ['firstName','lastName','email']
        }]
    }).then(comments => {
        comments.forEach(data => {
            result.push({userName:data.userInfo.firstName + " " + data.userInfo.lastName,
                userEmail:data.userInfo.email, comm: data.comment, commentId: data.id})
        });
    }).then(function (){
        res.json(result);
    }).catch((error) => {
        sendError(res,errorMsg.failedGetComment + error);
    });
};

/** The function adds a comment to the database and sends the id of
 *  the comment to the client. If there is an error, it sends the
 *  error message to the client.*/
exports.addComment = (req, res) => {

    const commentText = req.body.comment;
    const date = req.body.date;

    model.userInfo.findOne({
        where: { email: req.session.email }
    }).then(user => {
        let c = model.Comments.build({userId: user.id, comment: commentText, date: date});
        return c.save()
            .then((c) => {
                res.json({id: c.id});
            }).catch((error) => {
                if (error instanceof Sequelize.ValidationError) {
                    let customErrorMessage = error.errors.map(e => e.message).join(" ")
                    sendError(res, customErrorMessage);
                } else
                    sendError(res,error.message);
            })
    }).catch((error) => {
        sendError(res, error.message);
    });
};

/** A middleware function to check if comment exist - if the comment exist
 * then delete it else send error that the comment already deleted.*/
const middlewareCheckIfCommentExist = (req, res, next) => {

    const id = req.params.id;

    model.Comments.findOne({where: { id: id }})
        .then((comment) => {
            if(comment)
                next();
            else
                sendError(res, errorMsg.failedDeleteNonExistComment);
        })
        .catch((error) => {
            sendError(res,errorMsg.failedDeleteComment + error);
        });
}

/** Updates the destroyTime of a comment with the given id and sends
 * a status of 200 to the client if successful. If there is an error,
 * it sends an error message to the client.*/
const deletion = (req, res) => {

    const id = req.params.id;

    model.Comments.update({destroyTime: new Date()}, { where: { id: id } })
        .then(() => {
            res.status(200).end();
        })
        .catch((error) => {
            sendError(res,errorMsg.failedDeleteComment + error);
        });
}

exports.deleteComment = [middlewareCheckIfCommentExist, deletion];

/** get the changed dates of comments and sends it to the client.
 *  If there is an error, it sends an error message to the client.*/
exports.getChangedDates = (req, res) => {

    const fifteenSecondsAgo = new Date(new Date().getTime() - 15 * 1000);

    model.Comments.findAll({
        where: {[Sequelize.Op.or]:
                [{createdAt: {[Sequelize.Op.gte]: fifteenSecondsAgo}},
                    {destroyTime: {[Sequelize.Op.gte]: fifteenSecondsAgo}}]},
        attributes: ['date'],
        group: ['date'],
        paranoid: false
    }).then(updatedData => {
        const dateArray = updatedData.map(data => data.date);
        res.json(dateArray);
    }).catch(error => {
        sendError(res,errorMsg.failedGetChanges + error);
    });
}

/* sends an error message to the client with a status of 400.*/
const sendError = (res, msg) => {
    res.statusMessage = msg;
    res.status(400).end();
}