const { User, Notification, UserPreference } = require('../models');
const { highPriorityQueue, lowPriorityQueue, connection } = require('../queues/notification.queue');
const { v4: uuidv4 } = require('uuid');

exports.sendNotification = async (req, res) => {
  try {
    const { userId, type, content, channel, idempotencyKey } = req.body;

    // check if we alrdy sent this (idempotency)
    if (idempotencyKey) {
      const existingNotification = await Notification.findOne({
        where: { userId, idempotencyKey }
      });
      
      if (existingNotification) {
        return res.status(200).json({
          message: 'Notification already processed (Idempotent)',
          notificationId: existingNotification.id,
          status: existingNotification.status
        });
      }
    }


    if (!userId || !type || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // simple rate limit so we dont spam
    if (channel) {
      const rateLimitKey = `rl:${userId}:${channel}`;
      const requestCount = await connection.incr(rateLimitKey);
      
      if (requestCount === 1) {
        await connection.expire(rateLimitKey, 60);
      }

      if (requestCount > 5) {
        return res.status(429).json({ error: 'Rate limit exceeded. Try again later.' });
      }
    }


    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (channel) {
      const preference = await UserPreference.findOne({
        where: { userId, channel }
      });
      
      if (preference && !preference.isEnabled) {
        return res.status(400).json({ error: `User has disabled ${channel} notifications` });
      }
    }


    // Determine which queue to use
    const highPriorityTypes = ['OTP', 'SECURITY_ALERT', 'ORDER_CONFIRMED'];
    const targetQueue = highPriorityTypes.includes(type) ? highPriorityQueue : lowPriorityQueue;

    const notificationId = uuidv4();

    await targetQueue.add('send-notification', {
      notificationId,
      userId,
      type,
      content,
      channel,
      idempotencyKey
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000
      }
    });

    
    return res.status(202).json({
      message: 'Notification request accepted',
      notificationId: notificationId
    });

  } catch (error) {
    console.error('Error in sendNotification:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
exports.getNotificationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findByPk(id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({
      id: notification.id,
      status: notification.status,
      type: notification.type,
      channel: notification.channel,
      updatedAt: notification.updatedAt
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.trackNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { url } = req.query;

    const notification = await Notification.findByPk(id);

    if (notification) {
      await notification.update({ clickedAt: new Date() });
      console.log(`[Analytics] Notification ${id} was clicked!`);
    }

    return res.redirect(url || 'https://google.com');
  } catch (error) {
    console.error('Tracking error:', error);
    res.redirect('/');
  }
};
