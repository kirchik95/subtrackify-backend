# Subtrackify API Documentation

## 📍 Base URL

```
http://localhost:3000
```

## 🔍 Endpoints

### General

#### Health Check

```bash
GET /health
```

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2025-11-13T18:04:37.464Z",
  "database": "connected"
}
```

#### Welcome

```bash
GET /
```

**Response:**

```json
{
  "message": "Welcome to Subtrackify API",
  "version": "1.0.0"
}
```

---

### Subscriptions

#### Get All Subscriptions

```bash
GET /api/subscriptions
```

**Response:**

```json
[
  {
    "id": 1,
    "name": "Netflix",
    "description": "Streaming service",
    "price": "15.99",
    "currency": "USD",
    "billing_cycle": "monthly",
    "next_billing_date": "2025-12-01T00:00:00.000Z",
    "status": "active",
    "category": "Entertainment",
    "created_at": "2025-11-13T18:04:45.942Z",
    "updated_at": "2025-11-13T18:04:45.942Z",
    "user_id": null
  }
]
```

---

#### Get Subscription by ID

```bash
GET /api/subscriptions/:id
```

**Example:**

```bash
curl http://localhost:3000/api/subscriptions/1
```

**Response:**

```json
{
  "id": 1,
  "name": "Netflix",
  "description": "Streaming service",
  "price": "15.99",
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2025-12-01T00:00:00.000Z",
  "status": "active",
  "category": "Entertainment",
  "created_at": "2025-11-13T18:04:45.942Z",
  "updated_at": "2025-11-13T18:04:45.942Z",
  "user_id": null
}
```

**Error Response (404):**

```json
{
  "error": "Subscription not found"
}
```

---

#### Create Subscription

```bash
POST /api/subscriptions
Content-Type: application/json
```

**Request Body:**

```json
{
  "name": "Netflix", // Required
  "description": "Streaming service", // Optional
  "price": 15.99, // Required
  "currency": "USD", // Optional (default: USD)
  "billing_cycle": "monthly", // Required (monthly, yearly, weekly, etc.)
  "next_billing_date": "2025-12-01", // Required (YYYY-MM-DD)
  "category": "Entertainment" // Optional
}
```

**Example:**

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "description": "Streaming service for movies and TV shows",
    "price": 15.99,
    "currency": "USD",
    "billing_cycle": "monthly",
    "next_billing_date": "2025-12-01",
    "category": "Entertainment"
  }'
```

**Response (201):**

```json
{
  "id": 1,
  "name": "Netflix",
  "description": "Streaming service for movies and TV shows",
  "price": "15.99",
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2025-12-01T00:00:00.000Z",
  "status": "active",
  "category": "Entertainment",
  "created_at": "2025-11-13T18:04:45.942Z",
  "updated_at": "2025-11-13T18:04:45.942Z",
  "user_id": null
}
```

---

#### Update Subscription

```bash
PUT /api/subscriptions/:id
Content-Type: application/json
```

**Request Body (all fields optional):**

```json
{
  "name": "Netflix Premium",
  "description": "Updated description",
  "price": 19.99,
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2025-12-15",
  "status": "active",
  "category": "Entertainment"
}
```

**Example:**

```bash
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 17.99, "name": "Netflix Premium"}'
```

**Response:**

```json
{
  "id": 1,
  "name": "Netflix Premium",
  "description": "Streaming service for movies and TV shows",
  "price": "17.99",
  "currency": "USD",
  "billing_cycle": "monthly",
  "next_billing_date": "2025-12-01T00:00:00.000Z",
  "status": "active",
  "category": "Entertainment",
  "created_at": "2025-11-13T18:04:45.942Z",
  "updated_at": "2025-11-13T18:05:35.784Z",
  "user_id": null
}
```

**Error Response (404):**

```json
{
  "error": "Subscription not found"
}
```

**Error Response (400):**

```json
{
  "error": "No fields to update"
}
```

---

#### Delete Subscription

```bash
DELETE /api/subscriptions/:id
```

**Example:**

```bash
curl -X DELETE http://localhost:3000/api/subscriptions/1
```

**Response:**

```json
{
  "message": "Subscription deleted successfully"
}
```

**Error Response (404):**

```json
{
  "error": "Subscription not found"
}
```

---

## 📊 Database Schema

### Subscriptions Table

| Column            | Type          | Description                               |
| ----------------- | ------------- | ----------------------------------------- |
| id                | SERIAL        | Primary key                               |
| name              | VARCHAR(255)  | Subscription name                         |
| description       | TEXT          | Optional description                      |
| price             | DECIMAL(10,2) | Subscription price                        |
| currency          | VARCHAR(3)    | Currency code (default: USD)              |
| billing_cycle     | VARCHAR(50)   | Billing frequency (monthly, yearly, etc.) |
| next_billing_date | DATE          | Next billing date                         |
| status            | VARCHAR(50)   | Subscription status (default: active)     |
| category          | VARCHAR(100)  | Optional category                         |
| user_id           | INTEGER       | Foreign key to users table                |
| created_at        | TIMESTAMP     | Creation timestamp                        |
| updated_at        | TIMESTAMP     | Last update timestamp                     |

---

## 🚀 Testing with curl

### Create multiple subscriptions

```bash
# Netflix
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"Netflix","price":15.99,"billing_cycle":"monthly","next_billing_date":"2025-12-01","category":"Entertainment"}'

# Spotify
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"Spotify","price":9.99,"billing_cycle":"monthly","next_billing_date":"2025-12-05","category":"Music"}'

# GitHub Pro
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{"name":"GitHub Pro","price":4.00,"billing_cycle":"monthly","next_billing_date":"2025-12-10","category":"Development"}'
```

### Get all subscriptions (pretty print)

```bash
curl http://localhost:3000/api/subscriptions | python3 -m json.tool
```

### Update a subscription

```bash
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"price":17.99}' | python3 -m json.tool
```

### Delete a subscription

```bash
curl -X DELETE http://localhost:3000/api/subscriptions/1
```

---

## 🔐 Future Enhancements

- [ ] User authentication (JWT)
- [ ] User-specific subscriptions
- [ ] Subscription reminders
- [ ] Cost analytics
- [ ] Export to CSV/PDF
- [ ] Email notifications
- [ ] Multi-currency support
- [ ] Subscription categories management
