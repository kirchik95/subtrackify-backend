# ESLint и Prettier конфигурация

Этот проект использует ESLint и Prettier для обеспечения качества и консистентности кода.

## Установленные пакеты

- **eslint**: Основной линтер для JavaScript/TypeScript
- **typescript-eslint**: Поддержка TypeScript в ESLint
- **prettier**: Форматтер кода
- **@ianvs/prettier-plugin-sort-imports**: Автоматическая сортировка импортов
- **husky**: Git hooks для автоматизации проверок
- **lint-staged**: Запуск линтеров только на staged файлах

## Конфигурационные файлы

### eslint.config.js

Использует новый flat config формат ESLint. Настроен для:

- TypeScript файлов
- Node.js окружения
- Рекомендованные правила для JS и TypeScript

### prettier.config.js

Настройки форматирования:

- Одинарные кавычки
- Точка с запятой
- 2 пробела для отступов
- Максимальная ширина строки: 100 символов
- Автоматическая сортировка импортов

### lint-staged.config.js

Настроен для запуска при коммите:

- ESLint с автоисправлением для `.js` и `.ts` файлов
- Prettier для `.js`, `.ts`, `.json` и `.md` файлов

### .husky/pre-commit

Git hook, который запускает lint-staged перед каждым коммитом.

## Доступные команды

```bash
# Проверить код на ошибки
npm run lint

# Автоматически исправить ошибки линтинга
npm run lint:fix

# Отформатировать все файлы
npm run format

# Проверить, правильно ли отформатированы файлы
npm run format:check
```

## Автоматизация

При выполнении `git commit`:

1. Husky перехватывает коммит
2. lint-staged запускается для staged файлов
3. ESLint проверяет и исправляет проблемы
4. Prettier форматирует код
5. Если все проходит успешно, коммит выполняется
6. Если есть ошибки, коммит отклоняется

## Интеграция с IDE

Рекомендуется настроить вашу IDE для использования этих инструментов:

### VS Code

Установите расширения:

- ESLint (`dbaeumer.vscode-eslint`)
- Prettier (`esbenp.prettier-vscode`)

Добавьте в `settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
