const { Queue } = require('bullmq');
const IORedis = require('ioredis');

const connection = new IORedis(process.env.REDIS_URI || 'redis://127.0.0.1:6379');

// We now have two separate queues
const highPriorityQueue = new Queue('high-priority-queue', { connection });
const lowPriorityQueue = new Queue('low-priority-queue', { connection });

module.exports = {
  highPriorityQueue,
  lowPriorityQueue,
  connection
};
