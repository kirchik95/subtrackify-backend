# Changelog

All notable changes to the Subtrackify Backend.

## [Unreleased]

### Added

- **CORS** — `@fastify/cors` with env-driven `CORS_ORIGIN`, credentials support
- **Rate limiting** — `@fastify/rate-limit` globally 100 req/min; stricter limits on auth endpoints: login 5/min, register 3/min, forgot-password 3/min, reset-password 5/min
- **Refresh tokens** — access token 15min + refresh token 30 days (DB-stored, single-use rotation). New endpoints: `POST /auth/refresh`, `POST /auth/logout`
- **Category model** — dedicated `Category` table (id, name, icon, color, userId) with unique constraint per user. Full CRUD: `GET/POST /api/categories`, `PUT/DELETE /api/categories/:id`. Subscription `category` string replaced with `categoryId` FK. Subscriptions include category object in responses. Analytics and CSV export/import updated for category relation

### Fixed

- Allow `null` for `color` and `description` fields in subscription create/update schema

## [1.0.0] - 2026-03-29

### Added

- **Auth module** — registration, login, JWT (7-day expiry), bcrypt password hashing
- **Subscriptions module** — full CRUD with filtering (category, status, price range, search), pagination
- **Profile module** — update profile, change password, delete account
- **Avatar module** — upload/delete avatar (disk storage, max 5MB, JPEG/PNG/WebP)
- **Password reset module** — token generation (1h expiry), email sending, single-use tokens
- **Preferences module** — notifications (6 toggles), regional (currency, language, timezone), appearance (theme, compact mode)
- **Analytics module** — monthly summary with month-over-month change, spending history (12 months), category breakdown with percentages
- **Export/Import module** — CSV export with proper escaping, CSV import with row-level validation and error reporting
- **Categories** — extracted from subscriptions with optional count aggregation
- **Health check** — `/health` endpoint with DB connection status
- **Documentation** — CLAUDE.md, AGENTS.md, architecture docs, API reference, style guide
- **Docker** — multi-stage Dockerfile, docker-compose for dev environment
- **Dev tooling** — ESLint, Prettier, Husky pre-commit hooks, path aliases
