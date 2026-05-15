# System Architecture Deep Dive

This document provides a multi-layered view of the Notification Service architecture, from high-level traffic flow to low-level component interaction.

## 1. High-Level Architecture (The Macro View)
The system is built on an **Asynchronous Write-Back** pattern. This maximizes throughput by using Redis as a high-speed buffer.

```mermaid
graph TD
    Client[Upstream Services] -->|JSON Request| API[Express API]
    API -->|Async Push| Redis[(Redis Queue)]
    Redis -->|Job Event| Worker[Node.js Worker]
    Worker -->|Send| External[Email/SMS Providers]
    Worker -->|Persist| MySQL[(MySQL DB)]
```

---

## 2. Component Detail: The API Layer (Producer)
The API's primary goal is **low latency**. It performs only essential checks before offloading the work.

### API Internal Workflow
```mermaid
sequenceDiagram
    participant C as Client
    participant A as API
    participant R as Redis
    participant D as DB (MySQL)

    C->>A: POST /v1/notifications/send
    A->>A: Validate Payload
    A->>D: Check Idempotency Key
    A->>R: Increment Rate Limit Counter
    alt is allowed
        A->>A: Generate UUID
        A->>R: Push Job to Queue (High/Low)
        A-->>C: 202 Accepted (UUID)
    else is limited
        A-->>C: 429 Too Many Requests
    end
```

---

## 3. Component Detail: The Worker Layer (Consumer)
The Worker is the core execution engine. It handles the "heavy lifting" like template rendering and network I/O with third-party providers.

### Worker Internal Workflow
```mermaid
flowchart TD
    Start([Job Received]) --> SaveDB[Create 'PENDING' Record in MySQL]
    SaveDB --> FetchUser[Fetch User Contact Data]
    FetchUser --> Render[Template Service: Render Message]
    Render --> Route{Channel?}
    
    Route -- Email --> SendEmail[Call Provider.sendEmail]
    Route -- SMS --> SendSMS[Call Provider.sendSMS]
    Route -- Push --> SendPush[Call Provider.sendPush]

    SendEmail & SendSMS & SendPush --> Success{Success?}
    
    Success -- Yes --> UpdateSent[Update DB: status='SENT']
    Success -- No --> Retry[Trigger BullMQ Retry]
    
    Retry --> Backoff[Wait Exponential Time]
    Backoff --> Start
```

## 4. Scaling Strategy
- **Horizontal Scaling**: You can spin up 10 workers on 10 different servers. They all share the same Redis queue.
- **Priority Isolation**: We run separate worker instances for `high-priority-queue` and `low-priority-queue` to ensure critical alerts are never blocked by newsletters.
