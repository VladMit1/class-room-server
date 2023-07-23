const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');
const VideoChatController = require('../controllers/videoChatController');


router.get('/', authMiddleware, VideoChatController.studentsList);
//router.post('/', authMiddleware, VideoChatController.studentsList);
module.exports = router;
