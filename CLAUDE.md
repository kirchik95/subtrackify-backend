# CLAUDE.md

## Project Overview

Subtrackify Backend — REST API for subscription tracking. Built with **Fastify 5** + **TypeScript** + **Prisma 7** + **PostgreSQL**.

## Quick Reference

```bash
npm run dev                   # Start dev server (tsx watch)
npm run build                 # Build (prisma generate + tsc)
npm start                     # Run production build
npm run docker:dev            # Docker dev environment
npm run docker:dev:down       # Stop Docker dev
npm run lint:fix              # ESLint auto-fix
npm run format                # Prettier format
npm run prisma:migrate        # Create migration
npm run prisma:migrate:deploy # Apply migrations
npm run prisma:push           # Push schema to DB
npm run prisma:studio         # Visual DB editor
```

## Architecture

Modular architecture — each feature is a self-contained module in `src/modules/`:

```
src/modules/<feature>/
  ├── <feature>.schema.ts      # Zod schemas + inferred TS types
  ├── <feature>.service.ts     # Business logic, DB queries
  ├── <feature>.controller.ts  # HTTP handlers (calls service)
  └── <feature>.routes.ts      # Route registration + validation
```

**Modules:** `auth`, `subscriptions`, `profile`, `categories`

**Request flow:** Route (Zod validation) → Auth Plugin (JWT check) → Controller → Service → Prisma → DB

## Code Conventions

See [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md) for full style guide (formatting, naming, imports, patterns).

Key points:

- TypeScript strict, ESM only, all imports end with `.js`
- Path aliases: `@db/*`, `@modules/*`, `@plugins/*`, `@types`, `@/*`
- Zod schemas for validation, types inferred via `z.infer<>`
- Pre-commit hooks: Husky + lint-staged run ESLint + Prettier

## Database

- **ORM:** Prisma 7 with PostgreSQL
- **Schema:** `prisma/schema.prisma`
- **Models:** `User`, `Subscription` — camelCase fields in code, snake_case columns via `@map()`
- **Generated client output:** `src/generated/prisma`
- After changing schema: `npm run prisma:migrate` (dev) or `npm run prisma:push` (quick sync)

## Auth

- JWT Bearer tokens (`Authorization: Bearer <token>`)
- 7-day expiration, bcrypt password hashing (10 salt rounds)
- Protected routes wrapped in `protectedInstance` scope in `src/app.ts`
- Access user in controllers: `request.user!.userId`, `request.user!.email`

## Adding a New Module

1. Create `src/modules/<name>/` with 4 files: schema, service, controller, routes
2. Register in `src/app.ts`:
   - Public: `await fastify.register(routes, { prefix: '/api/<name>' })`
   - Protected: `await protectedInstance.register(routes, { prefix: '/api/<name>' })`

## Environment Variables

Required: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV`
Optional: `PORT` (3000), `HOST` (0.0.0.0), `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_HOST`, `DB_PORT`
See `env.example` for all values.

## Key Dependencies

- **Fastify 5** — web framework
- **Prisma 7** — ORM
- **Zod 4** — runtime validation
- **bcrypt** — password hashing
- **jsonwebtoken** — JWT auth
- **date-fns** — date utilities
- **lodash-es** — utility functions

## Documentation

Detailed docs in `docs/`: ARCHITECTURE, API, PRISMA, QUICKSTART, SECURITY, LINTING, LIBRARIES, ALIASES.
