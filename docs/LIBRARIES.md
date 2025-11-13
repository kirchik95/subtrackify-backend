# Используемые библиотеки

## 📦 Установленные библиотеки

### lodash-es

Набор утилит для работы с массивами, объектами, строками и другими типами данных. ES Modules версия для современных проектов.

**Примеры использования:**

```typescript
import { cloneDeep, debounce, get, groupBy, uniq } from 'lodash-es';

// Группировка подписок по категориям
const subscriptionsByCategory = groupBy(subscriptions, 'category');

// Получение уникальных категорий
const uniqueCategories = uniq(subscriptions.map((s) => s.category));

// Глубокое клонирование объекта
const clonedSubscription = cloneDeep(subscription);

// Debounce для оптимизации запросов
const debouncedSearch = debounce(searchFunction, 300);

// Получение значения по пути
const userName = get(user, 'profile.name', 'Anonymous');
```

### date-fns

Современная библиотека для работы с датами.

**Примеры использования:**

```typescript
import { addMonths, differenceInDays, format, isAfter } from 'date-fns';

// Форматирование даты
const formatted = format(new Date(), 'yyyy-MM-dd');

// Добавление месяцев для следующего платежа
const nextBillingDate = addMonths(subscription.nextBillingDate, 1);

// Проверка, просрочена ли подписка
const isOverdue = isAfter(new Date(), subscription.nextBillingDate);

// Дней до следующего платежа
const daysUntilBilling = differenceInDays(subscription.nextBillingDate, new Date());
```

### zod

Валидация схем данных с TypeScript inference.

**Примеры использования:**

```typescript
import { z } from 'zod';

// Схема для создания подписки
const createSubscriptionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  currency: z.string().length(3, 'Currency must be 3 characters').default('USD'),
  billingCycle: z.enum(['monthly', 'yearly', 'weekly']),
  nextBillingDate: z.string().datetime(),
  category: z.string().optional(),
});

// Использование в route handler
fastify.post('/api/subscriptions', async (request, reply) => {
  try {
    const validated = createSubscriptionSchema.parse(request.body);
    // validated имеет правильные типы!
  } catch (error) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ errors: error.errors });
    }
  }
});

// Схема для регистрации пользователя
const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
});
```

### bcrypt

Хеширование паролей для безопасного хранения.

**Примеры использования:**

```typescript
import bcrypt from 'bcrypt';

// Регистрация - хеширование пароля
const saltRounds = 10;
const passwordHash = await bcrypt.hash(password, saltRounds);

// Сохранение в БД
const user = await prisma.user.create({
  data: {
    email,
    passwordHash,
    name,
  },
});

// Логин - проверка пароля
const user = await prisma.user.findUnique({ where: { email } });
const isValidPassword = await bcrypt.compare(password, user.passwordHash);

if (!isValidPassword) {
  return reply.status(401).send({ error: 'Invalid credentials' });
}
```

### jsonwebtoken

Создание и проверка JWT токенов для аутентификации.

**Примеры использования:**

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Создание токена при логине
const token = jwt.sign(
  {
    userId: user.id,
    email: user.email,
  },
  JWT_SECRET,
  { expiresIn: '7d' }
);

return reply.send({ token, user });

// Middleware для проверки токена
const verifyToken = async (request, reply) => {
  try {
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return reply.status(401).send({ error: 'No token provided' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
};

// Использование middleware
fastify.register(async (instance) => {
  instance.addHook('preHandler', verifyToken);

  instance.get('/api/subscriptions', async (request, reply) => {
    // request.user доступен здесь
    const userId = request.user.userId;
    // ...
  });
});
```

## 🔧 Рекомендации по использованию

### Валидация входных данных

Всегда используйте `zod` для валидации данных от пользователя:

```typescript
import { z } from 'zod';

const schema = z.object({
  // define schema
});

// В route handler
const result = schema.safeParse(request.body);
if (!result.success) {
  return reply.status(400).send({ errors: result.error.errors });
}

// Используйте result.data (валидированные данные)
```

### Безопасность паролей

```typescript
// ✅ Правильно
const hash = await bcrypt.hash(password, 10);

// ❌ Неправильно - не храните пароли в открытом виде
const user = { password: password }; // НИКОГДА!
```

### Работа с датами

```typescript
// ✅ Правильно - используйте date-fns
import { addDays, format } from 'date-fns';

// ❌ Избегайте встроенных методов Date для сложных операций
const date = new Date();
date.setDate(date.getDate() + 7); // Менее читабельно
```

### Утилиты lodash-es

```typescript
// ✅ Используйте именованные импорты для лучшего tree-shaking
// Или импортируйте все необходимые функции
import {
  cloneDeep,
  debounce,
  filter,
  get,
  groupBy,
  groupBy,
  map,
  omit,
  pick,
  uniq,
  uniq,
} from 'lodash-es';
```

## 📚 Дополнительная документация

- [lodash-es docs](https://lodash.com/docs/) - (та же документация, что и для lodash)
- [date-fns docs](https://date-fns.org/docs/)
- [zod docs](https://zod.dev/)
- [bcrypt docs](https://github.com/kelektiv/node.bcrypt.js)
- [jsonwebtoken docs](https://github.com/auth0/node-jsonwebtoken)

## 💡 Почему lodash-es?

Этот проект использует `lodash-es` вместо обычного `lodash`, потому что:

- ✅ ES Modules совместимость (проект использует `"type": "module"`)
- ✅ Лучший tree-shaking - импортируются только используемые функции
- ✅ Нативная поддержка современных бандлеров
- ✅ Отличная поддержка TypeScript с именованными импортами
