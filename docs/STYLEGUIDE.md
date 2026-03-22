# Style Guide

Правила оформления кода в проекте Subtrackify Backend.

## TypeScript

- **Strict mode** включен
- Target: ES2022, Module: NodeNext
- ESM only — `import`/`export`, никакого `require`

## Форматирование (Prettier)

| Правило                    | Значение                 |
| -------------------------- | ------------------------ |
| Кавычки                    | Одинарные (`'`)          |
| Отступы                    | 2 пробела                |
| Точка с запятой            | Да                       |
| Trailing commas            | `es5`                    |
| Максимальная ширина строки | 100 символов             |
| Скобки в объектах          | С пробелами (`{ a: 1 }`) |
| Перевод строки             | LF                       |

## Импорты

### Расширения файлов

Все импорты **обязательно** заканчиваются на `.js` (требование NodeNext module resolution):

```typescript
// Правильно

// Неправильно
import prisma from '@db/prisma';
import prisma from '@db/prisma.js';
import { authRoutes } from '@modules/auth/auth.routes.js';
```

### Path aliases

Используй алиасы вместо относительных путей:

| Алиас        | Путь                 | Пример                                                      |
| ------------ | -------------------- | ----------------------------------------------------------- |
| `@/*`        | `src/*`              | `import { foo } from '@/utils/foo.js'`                      |
| `@db/*`      | `src/db/*`           | `import prisma from '@db/prisma.js'`                        |
| `@modules/*` | `src/modules/*`      | `import { authRoutes } from '@modules/auth/auth.routes.js'` |
| `@plugins/*` | `src/plugins/*`      | `import authPlugin from '@plugins/auth.plugin.js'`          |
| `@types`     | `src/types/index.ts` | `import type { JwtPayload } from '@types'`                  |

### Порядок импортов

Автоматически сортируется Prettier-плагином `@ianvs/prettier-plugin-sort-imports`:

1. `fastify` / `fastify/*`
2. `@fastify/*`
3. _(пустая строка)_
4. Сторонние библиотеки
5. _(пустая строка)_
6. `@/` алиасы
7. _(пустая строка)_
8. Относительные импорты

## Именование

| Элемент         | Стиль                      | Пример                              |
| --------------- | -------------------------- | ----------------------------------- |
| Файлы модуля    | kebab-case + суффикс       | `auth.schema.ts`, `auth.service.ts` |
| Классы          | PascalCase                 | `AuthService`, `AuthController`     |
| Функции/методы  | camelCase                  | `createUser`, `getSubscriptions`    |
| Переменные      | camelCase                  | `userId`, `billingCycle`            |
| Константы       | camelCase или UPPER_SNAKE  | `jwtSecret`, `SALT_ROUNDS`          |
| Типы/интерфейсы | PascalCase                 | `CreateUserInput`, `JwtPayload`     |
| Zod-схемы       | camelCase + Schema         | `createUserSchema`, `loginSchema`   |
| Таблицы БД      | snake_case (через `@@map`) | `users`, `subscriptions`            |
| Колонки БД      | snake_case (через `@map`)  | `password_hash`, `billing_cycle`    |
| Prisma модели   | PascalCase                 | `User`, `Subscription`              |
| Поля Prisma     | camelCase                  | `passwordHash`, `billingCycle`      |

## Паттерны экспорта

### Сервисы — singleton

```typescript
export class SubscriptionsService {
  async getAll(userId: number) {
    /* ... */
  }
}

export const subscriptionsService = new SubscriptionsService();
```

### Контроллеры — singleton

```typescript
export class SubscriptionsController {
  async getAll(request: FastifyRequest, reply: FastifyReply) {
    /* ... */
  }
}

export const subscriptionsController = new SubscriptionsController();
```

### Роуты — async function

```typescript
export async function subscriptionsRoutes(fastify: FastifyInstance) {
  fastify.get('/', subscriptionsController.getAll.bind(subscriptionsController));
}
```

### Zod-схемы — export const + inferred type

```typescript
export const createSubscriptionSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
});

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionSchema>;
```

## Неиспользуемые переменные

Префикс `_` для неиспользуемых аргументов (ESLint правило):

```typescript
// Правильно
app.get('/', async (_request, reply) => {
  /* ... */
});

// Неправильно — ESLint warning
app.get('/', async (request, reply) => {
  /* ... */
});
```

## Обработка ошибок

- `try/catch` в контроллерах
- HTTP коды: 400 (валидация), 401 (не авторизован), 404 (не найдено), 500 (сервер)
- Единый формат ответа: `{ success: boolean, data?: any, error?: string }`

## Линтинг и форматирование

### Команды

```bash
npm run lint          # Проверка ESLint
npm run lint:fix      # ESLint с автоисправлением
npm run format        # Prettier форматирование
npm run format:check  # Проверка форматирования
```

### Pre-commit hooks

При `git commit` автоматически запускается через Husky + lint-staged:

1. ESLint проверяет и исправляет `.js`/`.ts` файлы
2. Prettier форматирует `.js`, `.ts`, `.json`, `.md` файлы
3. Если есть ошибки — коммит отклоняется

### IDE (VS Code)

Расширения: `dbaeumer.vscode-eslint`, `esbenp.prettier-vscode`

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
