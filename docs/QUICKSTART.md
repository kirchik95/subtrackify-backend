# 🚀 Быстрый старт Subtrackify Backend

## Что уже настроено ✅

- ✅ Fastify сервер с TypeScript
- ✅ PostgreSQL база данных
- ✅ **Prisma ORM** - современный type-safe ORM
- ✅ **Prisma Studio** - визуальный редактор БД
- ✅ Docker & Docker Compose конфигурация
- ✅ CRUD API для подписок
- ✅ Автоматические миграции БД
- ✅ Hot reload в режиме разработки
- ✅ Health check endpoint
- ✅ pgAdmin для управления БД (опционально)

## Запуск за 3 шага

### 1. Убедитесь, что Docker запущен

```bash
docker --version
docker-compose --version
```

### 2. Запустите приложение

```bash
npm run docker:dev
```

Это запустит:

- 🐘 **PostgreSQL** на порту `5432`
- 🚀 **API** на порту `3000`
- 🔧 **pgAdmin** на порту `5050` (опционально)

### 3. Проверьте работу

```bash
curl http://localhost:3000/health
```

Ожидаемый ответ:

```json
{
  "status": "ok",
  "timestamp": "2025-11-13T18:04:37.464Z",
  "database": "connected"
}
```

## 📍 Доступные URL

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **pgAdmin**: http://localhost:5050 (email: `admin@subtrackify.local`, пароль: `admin`)

## 🧪 Тестовые запросы

### Создать подписку

```bash
curl -X POST http://localhost:3000/api/subscriptions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Netflix",
    "price": 15.99,
    "billing_cycle": "monthly",
    "next_billing_date": "2025-12-01",
    "category": "Entertainment"
  }'
```

### Получить все подписки

```bash
curl http://localhost:3000/api/subscriptions
```

### Обновить подписку

```bash
curl -X PUT http://localhost:3000/api/subscriptions/1 \
  -H "Content-Type: application/json" \
  -d '{"price": 17.99}'
```

### Удалить подписку

```bash
curl -X DELETE http://localhost:3000/api/subscriptions/1
```

## 🛠️ Полезные команды

### Docker команды

```bash
# Остановить приложение
npm run docker:dev:down

# Посмотреть логи
npm run docker:logs

# Полностью очистить (удалить volumes с данными)
npm run docker:clean

# Запустить production версию
npm run docker:prod

# Локальная разработка (без Docker)
npm run dev
```

### Prisma команды

```bash
# Открыть Prisma Studio (визуальный редактор БД)
npm run prisma:studio

# Создать миграцию
npm run prisma:migrate

# Применить изменения схемы к БД
npm run prisma:push

# Генерировать Prisma Client
npm run prisma:generate
```

## 📁 Структура проекта

```
subtrackify-backend/
├── src/
│   ├── index.ts          # Главный файл с API endpoints
│   └── db.ts             # Подключение к PostgreSQL
├── dist/                 # Скомпилированные файлы (создается после build)
├── Dockerfile            # Production образ
├── Dockerfile.dev        # Development образ
├── docker-compose.yml    # Production конфигурация
├── docker-compose.dev.yml # Development конфигурация
├── package.json          # Зависимости и скрипты
├── tsconfig.json         # TypeScript конфигурация
├── .env                  # Переменные окружения
├── env.example           # Пример переменных окружения
├── README.md             # Полная документация
├── API.md                # API документация
└── QUICKSTART.md         # Этот файл
```

## 🔧 Переменные окружения

Файл `.env` уже создан со значениями по умолчанию:

```env
NODE_ENV=development
PORT=3000
HOST=0.0.0.0

DB_USER=subtrackify
DB_PASSWORD=subtrackify_secret
DB_NAME=subtrackify
DB_HOST=localhost
DB_PORT=5432

DATABASE_URL=postgresql://subtrackify:subtrackify_secret@localhost:5432/subtrackify
```

## 🐛 Отладка

### Проверить статус контейнеров

```bash
docker-compose -f docker-compose.dev.yml ps
```

### Посмотреть логи API

```bash
docker-compose -f docker-compose.dev.yml logs api-dev --tail=50 -f
```

### Посмотреть логи PostgreSQL

```bash
docker-compose -f docker-compose.dev.yml logs postgres --tail=50 -f
```

### Подключиться к контейнеру

```bash
docker exec -it subtrackify-api-dev sh
```

### Подключиться к PostgreSQL

```bash
docker exec -it subtrackify-db-dev psql -U subtrackify -d subtrackify
```

## 📚 Дополнительная документация

- **PRISMA.md** - Полное руководство по Prisma ORM
- **API.md** - Полная документация API с примерами
- **README.md** - Подробная документация проекта

## 🎯 Что дальше?

1. ✅ Базовый CRUD готов
2. 🔜 Добавить аутентификацию пользователей
3. 🔜 Добавить напоминания о подписках
4. 🔜 Добавить аналитику расходов
5. 🔜 Добавить экспорт данных

## 💡 Советы

- Используйте **Prisma Studio** (`npm run prisma:studio`) для удобного просмотра и редактирования данных
- Используйте **pgAdmin** (http://localhost:5050) для расширенного управления БД
- Логи API доступны через `npm run docker:logs`
- В режиме dev файлы обновляются автоматически (hot reload)
- Данные БД сохраняются в Docker volumes и не удаляются при перезапуске
- API теперь использует **camelCase** для полей (например: `billingCycle` вместо `billing_cycle`)

---

Готово! 🎉 Ваш backend работает в Docker с PostgreSQL!
