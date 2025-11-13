# Architecture

Этот проект использует модульную архитектуру для организации кода.

## 📁 Структура проекта

```
src/
├── app.ts                 # Конфигурация Fastify приложения
├── index.ts               # Точка входа
├── db/                    # Database layer
│   └── prisma.ts         # Prisma client
├── modules/               # Feature modules
│   ├── auth/             # Authentication module
│   ├── categories/       # Categories module
│   ├── profile/          # User profile module
│   └── subscriptions/    # Subscriptions module
├── plugins/              # Fastify plugins
│   └── auth.plugin.ts   # JWT authentication
└── types/                # TypeScript types
    └── index.ts         # Common types
```

## 🏗️ Модульная архитектура

Каждый модуль состоит из 4 основных файлов:

### 1. **`*.schema.ts`** - Схемы валидации (Zod)

Содержит схемы валидации для входных данных и TypeScript типы.

```typescript
export const createSchema = z.object({
  // validation rules
});

export type CreateInput = z.infer<typeof createSchema>;
```

### 2. **`*.service.ts`** - Бизнес-логика

Содержит всю бизнес-логику и работу с базой данных.

```typescript
export class SomeService {
  async create(data: CreateInput) {
    return prisma.model.create({ data });
  }
}

export const someService = new SomeService();
```

### 3. **`*.controller.ts`** - Обработчики запросов

Обрабатывает HTTP запросы и вызывает методы сервиса.

```typescript
export class SomeController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const result = await someService.create(request.body);
    return reply.status(201).send({ success: true, data: result });
  }
}

export const someController = new SomeController();
```

### 4. **`*.routes.ts`** - Определение маршрутов

Регистрирует endpoints с валидацией и привязывает их к контроллерам.

```typescript
export async function someRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/',
    {
      schema: { body: createSchema },
    },
    someController.create.bind(someController)
  );
}
```

## 📦 Модули

### Auth Module (`modules/auth/`)

**Endpoints:**

- `POST /api/auth/register` - Регистрация пользователя
- `POST /api/auth/login` - Вход пользователя
- `GET /api/auth/me` - Получить текущего пользователя (protected)

**Features:**

- Хеширование паролей с bcrypt
- JWT токены для аутентификации
- Валидация email и пароля

### Subscriptions Module (`modules/subscriptions/`)

**Endpoints:**

- `GET /api/subscriptions` - Получить все подписки (с фильтрами)
- `GET /api/subscriptions/:id` - Получить подписку по ID
- `POST /api/subscriptions` - Создать подписку
- `PUT /api/subscriptions/:id` - Обновить подписку
- `DELETE /api/subscriptions/:id` - Удалить подписку

**Features:**

- CRUD операции для подписок
- Фильтрация по категории, статусу, цене
- Привязка к пользователю

### Categories Module (`modules/categories/`)

**Endpoints:**

- `GET /api/categories` - Получить все категории пользователя
  - Query: `?includeCount=true` - включить количество подписок

**Features:**

- Автоматическое извлечение уникальных категорий
- Подсчет подписок по категориям

### Profile Module (`modules/profile/`)

**Endpoints:**

- `GET /api/profile` - Получить профиль пользователя
- `PUT /api/profile` - Обновить профиль
- `POST /api/profile/change-password` - Изменить пароль
- `DELETE /api/profile` - Удалить аккаунт

**Features:**

- Управление профилем пользователя
- Смена пароля с проверкой текущего
- Удаление аккаунта

## 🔌 Plugins

### Auth Plugin (`plugins/auth.plugin.ts`)

Fastify плагин для аутентификации с JWT.

**Usage:**

```typescript
// В защищенных маршрутах
fastify.addHook('onRequest', fastify.authenticate);

// Доступ к пользователю в контроллере
const userId = request.user!.userId;
```

## 🎯 Преимущества архитектуры

### 1. **Разделение ответственности**

- **Schema**: Валидация
- **Service**: Бизнес-логика
- **Controller**: HTTP обработка
- **Routes**: Конфигурация маршрутов

### 2. **Легкое тестирование**

Каждый слой можно тестировать независимо:

```typescript
// Тестирование сервиса (без HTTP)
const result = await someService.create(mockData);
```

### 3. **Повторное использование**

Сервисы можно использовать в разных контроллерах:

```typescript
// В другом контроллере
const user = await authService.verifyToken(token);
```

### 4. **Масштабируемость**

Легко добавить новый модуль:

```bash
mkdir src/modules/new-feature
touch src/modules/new-feature/{schema,service,controller,routes}.ts
```

### 5. **Type Safety**

TypeScript типы выводятся из Zod схем:

```typescript
// Автоматическая типизация из схемы
export type CreateInput = z.infer<typeof createSchema>;
```

## 🔒 Аутентификация

### Публичные маршруты

```typescript
// Не требуют токена
POST /api/auth/register
POST /api/auth/login
GET /health
GET /
```

### Защищенные маршруты

```typescript
// Требуют JWT токен в header: Authorization: Bearer <token>
GET / api / auth / me;
GET / api / subscriptions;
POST / api / subscriptions;
// ... и т.д.
```

### Получение пользователя

В любом защищенном endpoint:

```typescript
const userId = request.user!.userId;
const email = request.user!.email;
```

## 🚀 Добавление нового модуля

1. **Создать структуру:**

```bash
mkdir -p src/modules/my-module
cd src/modules/my-module
```

2. **Создать файлы:**

```bash
touch my-module.schema.ts
touch my-module.service.ts
touch my-module.controller.ts
touch my-module.routes.ts
```

3. **Реализовать логику** в каждом файле

4. **Зарегистрировать маршруты** в `src/app.ts`:

```typescript
import { myModuleRoutes } from './modules/my-module/my-module.routes.js';

// Для защищенных маршрутов
await protectedInstance.register(myModuleRoutes, { prefix: '/api/my-module' });

// Для публичных маршрутов
await fastify.register(myModuleRoutes, { prefix: '/api/my-module' });
```

## 📚 Best Practices

1. **Один модуль = одна feature**
2. **Сервис не должен знать о HTTP**
3. **Контроллер только обрабатывает HTTP, логика в сервисе**
4. **Всегда валидируй входные данные с Zod**
5. **Используй TypeScript типы из схем**
6. **Экспортируй singleton instance сервиса**
7. **Bind методы контроллера при регистрации маршрутов**

## 🔄 Flow диаграмма запроса

```
Request
  ↓
[Route] - валидация схемы
  ↓
[Auth Plugin] - проверка токена (если protected)
  ↓
[Controller] - обработка HTTP
  ↓
[Service] - бизнес-логика
  ↓
[Prisma] - работа с БД
  ↓
[Service] - возврат результата
  ↓
[Controller] - формирование ответа
  ↓
Response
```
