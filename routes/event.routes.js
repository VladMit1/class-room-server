const Router = require('express');
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware');
const eventController = require('../controllers/eventController');

router.get('/events', authMiddleware, eventController.getEvents);
router.post('/add-event', authMiddleware, eventController.addEvent);
router.put('/update-event', authMiddleware, eventController.updateEvents);
router.delete('/delete', authMiddleware, eventController.deleteEvent);
module.exports = router;
