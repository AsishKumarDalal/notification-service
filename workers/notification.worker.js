const { Worker } = require('bullmq');
const { connection } = require('../queues/notification.queue');
const { Notification, User } = require('../models');
const providerService = require('../services/provider.service');
const templateService = require('../services/template.service');

// shared logic for processing
const processNotification = async (job) => {
  const { notificationId, userId, type, content, channel, idempotencyKey } = job.data;
  
  try {
    const notification = await Notification.create({
      id: notificationId,
      userId,
      type,
      content,
      channel,
      idempotencyKey,
      status: 'PENDING'
    });

    const user = await User.findByPk(userId);
    if (!user) throw new Error('User not found');

    const renderedMessage = templateService.render(type, content, notificationId);
    let success = false;

    if (channel === 'EMAIL') {
      success = await providerService.sendEmail(user.email, type, renderedMessage);
    } else if (channel === 'SMS') {
      success = await providerService.sendSMS(user.phoneNumber, renderedMessage);
    } else if (channel === 'PUSH') {
      success = await providerService.sendPush(user.pushToken, renderedMessage);
    }

    if (success) {
      await notification.update({ status: 'SENT' });
    } else {
      throw new Error('Provider failed');
    }
  } catch (error) {
    console.error(`[Worker] Error: ${error.message}`);
    throw error;
  }
};

// Start High Priority Worker
const highPriorityWorker = new Worker('high-priority-queue', processNotification, { 
  connection,
  concurrency: 5 // Process 5 at a time for VIP messages
});

// Start Low Priority Worker
const lowPriorityWorker = new Worker('low-priority-queue', processNotification, { 
  connection,
  concurrency: 1 // Only process 1 at a time for newsletters
});

highPriorityWorker.on('completed', job => console.log(`[VIP Worker] Job ${job.id} done`));
lowPriorityWorker.on('completed', job => console.log(`[Standard Worker] Job ${job.id} done`));

module.exports = { highPriorityWorker, lowPriorityWorker };
