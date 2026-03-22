# AGENTS.md

Instructions for AI agents working on the Subtrackify Backend codebase.

## Project Context

Subtrackify Backend is a REST API for subscription tracking built with Fastify 5, TypeScript, Prisma 7, and PostgreSQL. The codebase follows a modular architecture where each feature lives in `src/modules/<feature>/` with schema, service, controller, and routes files.

## Agent Guidelines

### Before Making Changes

- Read the relevant module files before modifying them
- Understand the existing patterns by examining at least one complete module (e.g., `src/modules/subscriptions/`)
- Check `prisma/schema.prisma` before writing any database-related code
- Check `src/app.ts` to understand how routes are registered

### Code Style

Follow [docs/STYLEGUIDE.md](docs/STYLEGUIDE.md) — formatting, naming, imports, export patterns.

Critical rules:

- All imports must end with **`.js` extension** (NodeNext resolution)
- Use **path aliases**: `@db/*`, `@modules/*`, `@plugins/*`, `@types`, `@/*`
- Export singleton service instances: `export const fooService = new FooService()`
- Bind controller methods in routes: `controller.method.bind(controller)`

### Creating New Modules

Follow the exact pattern of existing modules:

1. **Schema** (`<name>.schema.ts`): Define Zod schemas, export inferred types
2. **Service** (`<name>.service.ts`): Business logic class with Prisma queries, export singleton
3. **Controller** (`<name>.controller.ts`): HTTP handlers class calling service methods, export singleton
4. **Routes** (`<name>.routes.ts`): `async function <name>Routes(fastify: FastifyInstance)` registering routes with Zod schemas

Register in `src/app.ts`:

- Public routes: `await fastify.register(routes, { prefix: '/api/<name>' })`
- Protected routes: `await protectedInstance.register(routes, { prefix: '/api/<name>' })`

### Database Changes

- Edit `prisma/schema.prisma` for model changes
- Use camelCase for Prisma model fields, `@map("snake_case")` for DB columns
- Use `@@map("table_name")` for table names
- Run `npm run prisma:migrate` to create migrations after schema changes
- Generated Prisma client lives in `src/generated/prisma`

### Authentication

- JWT Bearer tokens in `Authorization` header
- Protected routes are inside the `protectedInstance` scope in `src/app.ts`
- Access user data via `request.user!.userId` and `request.user!.email`
- Auth plugin is in `src/plugins/auth.plugin.ts`

### Validation

- All request input must be validated with Zod schemas
- Define schemas in the module's schema file
- Types should be inferred from schemas: `type Foo = z.infer<typeof fooSchema>`
- Pass schemas to route definitions for automatic request validation

### Error Handling

- Use try/catch in controllers
- Return appropriate HTTP status codes (400, 401, 404, 500)
- Return consistent response shape: `{ success: boolean, data?: any, error?: string }`

### Testing

- No test framework is currently configured
- When adding tests, prefer Vitest (aligns with the ESM + TypeScript setup)

### What NOT to Do

- Do not install NestJS or Express — this is a Fastify project
- Do not use CommonJS (`require`) — project uses ESM (`import`)
- Do not skip `.js` extensions on imports
- Do not expose passwords, secrets, or API keys in code
- Do not modify `src/generated/prisma/` — it's auto-generated
- Do not add unnecessary abstractions or over-engineer solutions
