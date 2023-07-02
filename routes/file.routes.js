const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');
const fileController = require('../controllers/fileController');
//const multer = require('multer');
//const upload = multer();
//router.post('', authMiddleware, fileController.createDir);
//router.post('/upload', authMiddleware, fileController.uploadFile);
router.post(
   '/profile/avatar',
   authMiddleware,
   //upload.any(),
   fileController.uploadAvatar
);
router.get('/books/book', authMiddleware, fileController.getPdf);
router.get('/books/list', authMiddleware, fileController.fileList);
//router.get('/download', authMiddleware, fileController.downloadFile);
//router.get('/search', authMiddleware, fileController.searchFile);
//router.delete('/', authMiddleware, fileController.deleteFile);
router.delete('/profile/avatar', authMiddleware, fileController.deleteAvatar);
module.exports = router;
