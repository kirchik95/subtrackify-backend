# Deployment

Руководство по деплою Subtrackify Backend.

## Docker (рекомендуемый способ)

### Development

```bash
# Запуск (API + PostgreSQL + pgAdmin)
npm run docker:dev

# Остановка
npm run docker:dev:down

# Логи
npm run docker:logs
```

Сервисы:

- API: http://localhost:3000
- PostgreSQL: localhost:5432
- pgAdmin: http://localhost:5050

### Production

```bash
# Запуск
npm run docker:prod

# Остановка
npm run docker:prod:down

# Полная очистка (удаление volumes)
npm run docker:clean
```

## Docker конфигурация

### Файлы

| Файл                     | Назначение                           |
| ------------------------ | ------------------------------------ |
| `Dockerfile`             | Production образ (multi-stage build) |
| `Dockerfile.dev`         | Development образ с hot reload       |
| `docker-compose.yml`     | Production конфигурация              |
| `docker-compose.dev.yml` | Development конфигурация             |

### Production Dockerfile

- Multi-stage build для минимального размера образа
- Base: `node:20-alpine`
- Запуск от непривилегированного пользователя `nodejs`
- Health check настроен
- Prisma client генерируется при сборке

### Development Dockerfile

- Volume mount для исходного кода (hot reload через `tsx watch`)
- PostgreSQL и pgAdmin включены

## Локальный запуск (без Docker)

```bash
# 1. Установка зависимостей
npm install

# 2. Настройка окружения
cp env.example .env
# Отредактировать .env — указать DATABASE_URL

# 3. Настройка БД
npm run prisma:migrate:deploy

# 4. Запуск
npm run dev       # development
npm run build && npm start  # production
```

## Чеклист перед деплоем в production

- [ ] Сменить `JWT_SECRET` (минимум 32 символа)
- [ ] Сменить `DB_PASSWORD`
- [ ] Отключить pgAdmin или защитить его
- [ ] Настроить HTTPS (nginx/Traefik + Let's Encrypt)
- [ ] Закрыть порт 5432 для внешнего доступа
- [ ] Настроить бэкапы БД
- [ ] Добавить rate limiting (`@fastify/rate-limit`)
- [ ] Настроить мониторинг `/health`
- [ ] Настроить CORS

Подробнее: [SECURITY.md](SECURITY.md)
