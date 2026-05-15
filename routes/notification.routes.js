const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');

router.post('/send', notificationController.sendNotification);
router.get('/:id/status', notificationController.getNotificationStatus);
router.get('/:id/track', notificationController.trackNotification);

module.exports = router;
