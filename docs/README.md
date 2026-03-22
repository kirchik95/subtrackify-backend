# Documentation

Документация проекта Subtrackify Backend.

## Содержание

| Документ                        | Описание                                                  |
| ------------------------------- | --------------------------------------------------------- |
| [QUICKSTART](QUICKSTART.md)     | Быстрый старт — запуск за 3 шага                          |
| [ARCHITECTURE](ARCHITECTURE.md) | Модульная архитектура проекта                             |
| [API](API.md)                   | Полный справочник API с примерами                         |
| [PRISMA](PRISMA.md)             | Работа с базой данных и Prisma ORM                        |
| [SECURITY](SECURITY.md)         | Безопасность и рекомендации для продакшена                |
| [STYLEGUIDE](STYLEGUIDE.md)     | Стиль кода: форматирование, именование, импорты, паттерны |
| [LIBRARIES](LIBRARIES.md)       | Обзор библиотек и примеры использования                   |
| [LINTING](LINTING.md)           | Настройка ESLint и Prettier                               |
| [ALIASES](ALIASES.md)           | Алиасы импортов (@db, @modules и т.д.)                    |
| [DEPLOYMENT](DEPLOYMENT.md)     | Деплой с Docker и Docker Compose                          |
| [ENV](ENV.md)                   | Переменные окружения                                      |

## Стек технологий

- **Runtime:** Node.js >= 18 (production: Node 20)
- **Framework:** Fastify 5
- **Language:** TypeScript (strict mode, ES2022)
- **Database:** PostgreSQL 16
- **ORM:** Prisma 7
- **Validation:** Zod 4
- **Auth:** JWT + bcrypt
- **Containerization:** Docker & Docker Compose
- **Code Quality:** ESLint, Prettier, Husky, lint-staged
