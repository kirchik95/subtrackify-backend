# Environment Variables

Переменные окружения для Subtrackify Backend.

## Настройка

```bash
cp env.example .env
```

## Обязательные переменные

| Переменная     | Описание                                            | Пример                                              |
| -------------- | --------------------------------------------------- | --------------------------------------------------- |
| `DATABASE_URL` | Строка подключения к PostgreSQL                     | `postgresql://user:pass@localhost:5432/subtrackify` |
| `JWT_SECRET`   | Секрет для подписи JWT токенов (минимум 32 символа) | `openssl rand -base64 32`                           |
| `NODE_ENV`     | Окружение                                           | `development` / `production`                        |

## Опциональные переменные

| Переменная         | Описание          | По умолчанию         |
| ------------------ | ----------------- | -------------------- |
| `PORT`             | Порт сервера      | `3000`               |
| `HOST`             | Хост сервера      | `0.0.0.0`            |
| `DB_USER`          | Пользователь БД   | `subtrackify`        |
| `DB_PASSWORD`      | Пароль БД         | `subtrackify_secret` |
| `DB_NAME`          | Имя базы данных   | `subtrackify`        |
| `DB_HOST`          | Хост БД           | `localhost`          |
| `DB_PORT`          | Порт БД           | `5432`               |
| `PGADMIN_EMAIL`    | Email для pgAdmin | `admin@example.com`  |
| `PGADMIN_PASSWORD` | Пароль pgAdmin    | `admin`              |
| `PGADMIN_PORT`     | Порт pgAdmin      | `5050`               |

## Безопасность

В **production** обязательно замените значения по умолчанию:

```bash
# Генерация безопасного JWT_SECRET
export JWT_SECRET=$(openssl rand -base64 32)

# Генерация пароля для БД
export DB_PASSWORD=$(openssl rand -base64 24)
```

Никогда не коммитьте `.env` файл в репозиторий. Файл `.env` добавлен в `.gitignore`.
