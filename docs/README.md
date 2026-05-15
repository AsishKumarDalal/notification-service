# Notification Service Documentation

Welcome to the documentation for our scalable, distributed Notification Service. This system is designed to handle high-volume message delivery across multiple channels (Email, SMS, Push) with guaranteed reliability.

## Project Structure

```text
notification_service/
├── config/             # Database & environment configuration
├── controllers/        # Request handling and business logic
├── docs/               # System design documentation (Current)
├── models/             # Sequelize database models (MySQL)
├── queues/             # BullMQ (Redis) producer setup
├── routes/             # API endpoint definitions
├── services/           # Third-party provider mocks and template logic
└── workers/            # Background consumers (The "Heavy Lifters")
```

## Core Technologies
- **Runtime**: Node.js (Express)
- **Database**: MySQL (Sequelize ORM)
- **Message Queue**: BullMQ (Powered by Redis)
- **Templating**: Handlebars.js

## Documentation Sections
1. [System Architecture](./architecture.md)
2. [Data Models & Schema](./data_models.md)
3. [Reliability & Scaling Strategies](./reliability.md)
4. [Message Lifecycle](./workflow.md)
