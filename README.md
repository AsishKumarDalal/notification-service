# Scalable Notification Service

A high-performance, distributed notification system built with **Node.js**, **Express**, **MySQL**, and **Redis**. 

This system is designed to handle high-traffic workloads (10,000+ notifications) using an asynchronous "Queue-First" architecture to ensure zero database bottlenecks during traffic spikes.

## 🚀 Features

- **Asynchronous Processing**: Uses BullMQ (Redis) to offload heavy tasks from the API.
- **High-Performance Architecture**: Generates UUIDs in memory and writes to the DB in the background to minimize latency.
- **Idempotency**: Prevents duplicate notifications using unique `idempotencyKey` checks.
- **Rate Limiting**: Protects users and providers from spamming via Redis-based limiting.
- **Template Engine**: Uses Handlebars to dynamically render email, SMS, and Push content.
- **Multi-Channel Support**: Logic ready for Email, SMS, and Push notifications.

## 🏗️ Architecture

1. **API (Producer)**: Receives requests, validates preferences, checks rate limits, and pushes to Redis.
2. **Redis Queue**: Acts as a high-speed buffer for pending tasks.
3. **Worker (Consumer)**: Picks up tasks, renders templates, sends notifications via providers, and persists results to MySQL.

## 🛠️ Setup

### Prerequisites
- Node.js (v16+)
- MySQL
- Redis

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your environment:
   Create a `.env` file in the root directory (see `.env.example`).
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASS=your_password
   DB_NAME=notification_db
   REDIS_HOST=127.0.0.1
   REDIS_PORT=6379
   PORT=3000
   ```

## 🚥 Running the App

```bash
# Start the API and Worker together
npm run dev
```

## 🧪 Testing

### 1. Send a Notification
```bash
curl -X POST http://localhost:3000/v1/notifications/send \
-H "Content-Type: application/json" \
-d '{
  "userId": "your-user-uuid",
  "type": "ORDER_CONFIRMED",
  "channel": "EMAIL",
  "idempotencyKey": "unique_key_123",
  "content": { 
    "name": "Asish",
    "item": "MacBook Pro",
    "orderId": "ORD-101"
  }
}'
```

### 2. Check Status
```bash
curl http://localhost:3000/v1/notifications/{notificationId}/status
```

##  Documentation
For a deep dive into the design decisions, check the `docs/` folder:
- [Architecture Details](./docs/architecture.md)
- [Data Models](./docs/data_models.md)
- [Reliability & Scaling](./docs/reliability.md)
