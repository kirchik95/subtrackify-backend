# Subtrackify Backend

Backend API for Subtrackify - subscription tracking application built with Fastify and PostgreSQL.

## 🚀 Features

- ✅ RESTful API with Fastify
- ✅ PostgreSQL database with Prisma ORM
- ✅ Type-safe database queries
- ✅ Automatic migrations
- ✅ Prisma Studio (visual database editor)
- ✅ Docker & Docker Compose support
- ✅ TypeScript with full type safety
- ✅ Hot reload in development
- ✅ Health check endpoint
- ✅ CRUD operations for subscriptions
- ✅ ESLint & Prettier configured
- ✅ Git hooks with Husky

## 📖 Documentation

- [API Documentation](docs/API.md) - Complete API reference with examples
- [Prisma Guide](docs/PRISMA.md) - Database schema and Prisma usage
- [Quick Start](docs/QUICKSTART.md) - Step-by-step getting started guide
- [Linting & Formatting](docs/LINTING.md) - ESLint and Prettier configuration
- [Libraries & Utilities](docs/LIBRARIES.md) - Guide to installed libraries and usage examples

## 📋 Prerequisites

- Node.js >= 18.0.0
- Docker & Docker Compose (for containerized deployment)
- PostgreSQL (if running locally without Docker)

## 🛠️ Installation

### Option 1: Local Development (without Docker)

1. Install dependencies:

```bash
npm install
```

2. Create `.env` file:

```bash
cp env.example .env
```

3. Update `.env` with your database credentials

4. Start PostgreSQL locally

5. Run the development server:

```bash
npm run dev
```

### Option 2: Docker Development (Recommended)

1. Create `.env` file:

```bash
cp env.example .env
```

2. Start all services (API + PostgreSQL + pgAdmin):

```bash
npm run docker:dev
```

The API will be available at `http://localhost:3000`

## 🐳 Docker Commands

```bash
# Start development environment
npm run docker:dev

# Stop development environment
npm run docker:dev:down

# Start production environment
npm run docker:prod

# Stop production environment
npm run docker:prod:down

# View logs
npm run docker:logs

# Clean up (remove volumes)
npm run docker:clean
```

## 📚 API Endpoints

### General

- `GET /` - Welcome message
- `GET /health` - Health check with database status

### Subscriptions

- `GET /api/subscriptions` - Get all subscriptions
- `GET /api/subscriptions/:id` - Get subscription by ID
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Example: Create Subscription

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "description": "Streaming service",
    "price": 15.99,
    "currency": "USD",
    "billing_cycle": "monthly",
    "next_billing_date": "2025-12-01",
    "category": "Entertainment"
  }'
```

## 🗄️ Database

The application uses PostgreSQL with the following tables:

### subscriptions

- `id` - Serial primary key
- `name` - Subscription name
- `description` - Optional description
- `price` - Price (decimal)
- `currency` - Currency code (default: USD)
- `billing_cycle` - Billing cycle (monthly, yearly, etc.)
- `next_billing_date` - Next billing date
- `status` - Status (default: active)
- `category` - Optional category
- `user_id` - Foreign key to users table
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

### users

- `id` - Serial primary key
- `email` - Unique email
- `password_hash` - Hashed password
- `name` - User name
- `created_at` - Creation timestamp
- `updated_at` - Update timestamp

## 🔧 Development

### Build for production

```bash
npm run build
```

### Run production build

```bash
npm start
```

## 📦 Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Fastify
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: Prisma
- **Utilities**: lodash, date-fns, zod
- **Security**: bcrypt, jsonwebtoken
- **Code Quality**: ESLint, Prettier, Husky
- **Dev Tools**: tsx (TypeScript execution), Prisma Studio
- **Containerization**: Docker & Docker Compose

## 🔐 Environment Variables

See `env.example` for all available environment variables:

- `NODE_ENV` - Environment (development/production)
- `PORT` - Server port (default: 3000)
- `HOST` - Server host (default: 0.0.0.0)
- `DATABASE_URL` - PostgreSQL connection string
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `DB_HOST` - Database host
- `DB_PORT` - Database port

## 🔍 pgAdmin Access

When running with Docker, pgAdmin is available at `http://localhost:5050`

Default credentials:

- Email: `admin@subtrackify.local`
- Password: `admin`

To connect to the database:

- Host: `postgres`
- Port: `5432`
- Database: `subtrackify`
- Username: `subtrackify`
- Password: `subtrackify_secret`

## 📝 License

ISC
