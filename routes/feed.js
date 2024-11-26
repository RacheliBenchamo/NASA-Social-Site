let express = require('express');

const middleware = require("./middleware");
const feed = require("../controllers/feedController");

let router = express.Router();
router.use(middleware.checkSession);

router.post('/post-comment', feed.addComment);

router.get('/get-changes', feed.getChangedDates);

router.get('/get-comments/:date', feed.getCommentsByDate);

router.delete('/delete-comment/:date/:id', feed.deleteComment)



module.exports = router;