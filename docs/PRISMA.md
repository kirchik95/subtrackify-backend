# Prisma Integration Guide

## 🎯 Overview

Subtrackify Backend now uses **Prisma ORM** for database operations, providing type-safe database access, automatic migrations, and a better developer experience.

## 📦 What's Installed

- `@prisma/client` - Prisma Client for database queries
- `prisma` - Prisma CLI for migrations and schema management
- `@fastify/postgres` - Fastify PostgreSQL plugin (future use)

## 📁 Project Structure

```
subtrackify-backend/
├── prisma/
│   ├── schema.prisma       # Database schema definition
│   └── migrations/         # Migration files (created by Prisma)
├── prisma.config.ts        # Prisma configuration
├── src/
│   ├── prisma.ts           # Prisma Client instance
│   └── index.ts            # API routes using Prisma
```

## 🗄️ Database Schema

### Models

#### User

```prisma
model User {
  id            Int            @id @default(autoincrement())
  email         String         @unique
  passwordHash  String         @map("password_hash")
  name          String?
  createdAt     DateTime       @default(now()) @map("created_at")
  updatedAt     DateTime       @updatedAt @map("updated_at")
  subscriptions Subscription[]
}
```

#### Subscription

```prisma
model Subscription {
  id              Int      @id @default(autoincrement())
  name            String
  description     String?
  price           Decimal  @db.Decimal(10, 2)
  currency        String   @default("USD")
  billingCycle    String   @map("billing_cycle")
  nextBillingDate DateTime @map("next_billing_date") @db.Date
  status          String   @default("active")
  category        String?
  userId          Int?     @map("user_id")
  createdAt       DateTime @default(now()) @map("created_at")
  updatedAt       DateTime @updatedAt @map("updated_at")
  user            User?    @relation(fields: [userId], references: [id])
}
```

## 🚀 Development Commands

### Prisma CLI Commands

```bash
# Generate Prisma Client (after schema changes)
npm run prisma:generate

# Create a new migration
npm run prisma:migrate

# Push schema changes to database (without creating migration)
npm run prisma:push

# Open Prisma Studio (GUI for database)
npm run prisma:studio

# Deploy migrations to production
npm run prisma:migrate:deploy
```

### Docker Commands with Prisma

```bash
# Start development environment (Prisma auto-configured)
npm run docker:dev

# Access Prisma Studio inside container
docker-compose -f docker-compose.dev.yml exec api-dev npx prisma studio

# Run migrations inside container
docker-compose -f docker-compose.dev.yml exec api-dev npx prisma migrate deploy
```

## 📝 API Changes

### Request/Response Format

API now uses **camelCase** for field names (Prisma convention):

**Before (with pg):**

```json
{
  "billing_cycle": "monthly",
  "next_billing_date": "2025-12-01"
}
```

**After (with Prisma):**

```json
{
  "billingCycle": "monthly",
  "nextBillingDate": "2025-12-01"
}
```

### Example: Create Subscription

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "description": "Streaming service",
    "price": 15.99,
    "billingCycle": "monthly",
    "nextBillingDate": "2025-12-01",
    "category": "Entertainment"
  }'
```

**Response:**

```json
{
  "id": 1,
  "name": "Netflix",
  "description": "Streaming service",
  "price": "15.99",
  "currency": "USD",
  "billingCycle": "monthly",
  "nextBillingDate": "2025-12-01T00:00:00.000Z",
  "status": "active",
  "category": "Entertainment",
  "userId": null,
  "createdAt": "2025-11-13T18:24:35.904Z",
  "updatedAt": "2025-11-13T18:24:35.904Z",
  "user": null
}
```

## 🔧 Configuration

### Environment Variables

Prisma uses the `DATABASE_URL` environment variable:

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

### Prisma Config

`prisma.config.ts` loads environment variables and configures Prisma:

```typescript
import 'dotenv/config';

import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  engine: 'classic',
  datasource: {
    url: env('DATABASE_URL'),
  },
});
```

## 🐳 Docker Integration

### Development (docker-compose.dev.yml)

- Prisma Client is generated at container startup
- Schema is pushed to database automatically (`prisma db push`)
- Hot reload works with Prisma changes

### Production (docker-compose.yml)

- Prisma Client is generated during Docker build
- Migrations are deployed at container startup (`prisma migrate deploy`)

## 📚 Using Prisma Client

### Basic Operations

```typescript
import prisma from './prisma.js';

// Find all
const subscriptions = await prisma.subscription.findMany({
  include: { user: true },
  orderBy: { createdAt: 'desc' },
});

// Find one
const subscription = await prisma.subscription.findUnique({
  where: { id: 1 },
  include: { user: true },
});

// Create
const newSub = await prisma.subscription.create({
  data: {
    name: 'Netflix',
    price: 15.99,
    billingCycle: 'monthly',
    nextBillingDate: new Date('2025-12-01'),
  },
});

// Update
const updated = await prisma.subscription.update({
  where: { id: 1 },
  data: { price: 19.99 },
});

// Delete
await prisma.subscription.delete({
  where: { id: 1 },
});
```

### Advanced Queries

```typescript
// Filter and pagination
const subscriptions = await prisma.subscription.findMany({
  where: {
    category: 'Entertainment',
    price: { gte: 10 },
  },
  take: 10,
  skip: 0,
  orderBy: { nextBillingDate: 'asc' },
});

// Count
const count = await prisma.subscription.count({
  where: { status: 'active' },
});

// Aggregation
const stats = await prisma.subscription.aggregate({
  _sum: { price: true },
  _avg: { price: true },
  _count: true,
});
```

## 🎨 Prisma Studio

Prisma Studio is a visual database editor:

```bash
# Local
npm run prisma:studio

# Docker
docker-compose -f docker-compose.dev.yml exec api-dev npx prisma studio
```

Access at: http://localhost:5555

## 🔄 Migrations

### Development

```bash
# Create and apply migration
npm run prisma:migrate

# Name your migration when prompted
# Example: "add_subscription_status_field"
```

### Production

Migrations are automatically deployed when container starts:

```dockerfile
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/index.js"]
```

## ✨ Benefits of Prisma

1. **Type Safety** - Full TypeScript support with auto-completion
2. **Auto-generated Types** - Types are generated from your schema
3. **Migrations** - Easy database schema versioning
4. **Prisma Studio** - Visual database editor
5. **Relations** - Easy handling of foreign keys and joins
6. **Validation** - Built-in data validation
7. **Query Builder** - Intuitive, readable queries

## 🐛 Troubleshooting

### "Prisma Client not generated"

```bash
npm run prisma:generate
```

### "Schema file not found"

Make sure `prisma/schema.prisma` exists and is properly configured.

### "Cannot connect to database"

Check your `DATABASE_URL` in `.env` file.

### Docker: "prisma command not found"

Rebuild containers:

```bash
npm run docker:dev:down
npm run docker:dev
```

## 📖 Resources

- [Prisma Docs](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [Fastify + Prisma](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management/fastify)

## 🎯 Next Steps

- [ ] Implement user authentication
- [ ] Add user-specific subscriptions
- [ ] Create more complex queries
- [ ] Add database seeding
- [ ] Implement soft deletes
- [ ] Add full-text search
