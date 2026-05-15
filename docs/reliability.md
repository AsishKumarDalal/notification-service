# Reliability & Resilience

In a distributed environment, "Failure is the norm." This document explains how our system survives outages and prevents abuse.

## 1. Rate Limiting Logic (The Shield)
We use a **Fixed Window Counter** pattern in Redis to prevent any single user or service from overwhelming our providers.

```mermaid
graph TD
    Req[Incoming Request] --> Key[Generate Key: rl:user_id:channel]
    Key --> Incr[Redis INCR key]
    Incr --> Check{Count > 5?}
    Check -- Yes --> Reject[Return 429 Error]
    Check -- No --> Allow[Proceed to Queue]
    
    Allow --> First{First Request?}
    First -- Yes --> Expire[Set Key Expiry: 60s]
```

## 2. Priority Queues (The Fast Lane)
We solve the "Blocked OTP" problem by separating traffic into different physical queues in Redis.

```mermaid
graph LR
    subgraph API
        M[Marketing Msg] --> L[Low Priority Queue]
        O[OTP Msg] --> H[High Priority Queue]
    end

    subgraph Workers
        W1[VIP Workers - 5 Concurrency]
        W2[Standard Workers - 1 Concurrency]
    end

    H --> W1
    L --> W2
```

## 3. Idempotency (The De-duplicator)
To ensure **Exactly-Once** (or At-Least-Once without duplicates) delivery, we use a pre-processing check.

1. **Client** provides an `idempotencyKey`.
2. **Server** checks MySQL for that key.
3. If it exists, the server returns the **old status** immediately.
4. This protects against network retries or "Double-Click" bugs on the frontend.

## 4. Exponential Backoff
When a third-party provider (like Twilio) is down, we don't spam them with retries.
- **Attempt 1**: Immediate
- **Attempt 2**: +1 Second
- **Attempt 3**: +4 Seconds
- **Attempt 4**: +16 Seconds
This gives the external system "Breathing Room" to recover.
