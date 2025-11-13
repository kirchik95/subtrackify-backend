# Алиасы импортов (Import Aliases)

## Обзор

В проекте настроены алиасы путей импорта для упрощения работы с модулями и избежания относительных путей типа `../../..`.

## Доступные алиасы

| Алиас        | Путь                 | Описание                    |
| ------------ | -------------------- | --------------------------- |
| `@/*`        | `src/*`              | Корневая директория src     |
| `@db/*`      | `src/db/*`           | База данных и Prisma клиент |
| `@modules/*` | `src/modules/*`      | Модули приложения           |
| `@plugins/*` | `src/plugins/*`      | Плагины Fastify             |
| `@types`     | `src/types/index.ts` | Общие типы приложения       |

## Примеры использования

### До (относительные пути)

```typescript
import prisma from '../../db/prisma.js';
import type { AuthTokenPayload } from '../../types/index.js';
import { authService } from '../auth/auth.service.js';
```

### После (с алиасами)

```typescript
import prisma from '@db/prisma.js';
import { authService } from '@modules/auth/auth.service.js';
import type { AuthTokenPayload } from '@types';
```

## Конфигурация

### TypeScript (tsconfig.json)

Алиасы настроены через параметры `baseUrl` и `paths`:

```json
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"],
      "@db/*": ["./db/*"],
      "@modules/*": ["./modules/*"],
      "@plugins/*": ["./plugins/*"],
      "@types": ["./types/index.ts"]
    }
  }
}
```

### Runtime поддержка

Для поддержки алиасов в runtime используется пакет `tsconfig-paths`:

- **Разработка**: `tsx` автоматически поддерживает алиасы из `tsconfig.json`
- **Production**: Используется флаг `--import tsconfig-paths/register` при запуске Node.js

```json
{
  "scripts": {
    "dev": "tsx watch --tsconfig ./tsconfig.json src/index.ts",
    "start": "node --import tsconfig-paths/register dist/index.js"
  }
}
```

## Важные замечания

### 1. Расширения файлов

При использовании ES модулей (type: "module") **необходимо указывать расширения `.js`** даже для TypeScript файлов:

```typescript
// ✅ Правильно

// ❌ Неправильно
import prisma from '@db/prisma';
import prisma from '@db/prisma.js';
```

### 2. Алиас @types

Для импорта типов из `src/types/index.ts` можно использовать короткую форму:

```typescript
// Оба варианта работают
import type { AuthTokenPayload } from '@types';
import type { AuthTokenPayload } from '@types/index.js';
```

### 3. Внутри одного модуля

Внутри модуля рекомендуется использовать относительные пути для локальных файлов:

```typescript
// В файле auth.service.ts
import type { LoginInput } from './auth.schema.js'; // ✅ Относительный путь
```

Алиасы лучше использовать для импорта из других модулей:

```typescript
// В файле auth.service.ts
import prisma from '@db/prisma.js'; // ✅ Другой модуль
import type { User } from '@types'; // ✅ Общие типы
```

## Поддержка IDE

### VS Code

TypeScript настроен через `tsconfig.json`, поэтому VS Code автоматически поддерживает:

- Автодополнение путей с алиасами
- Переход к определению (Go to Definition)
- Рефакторинг и переименование

### Другие IDE

Большинство современных IDE (WebStorm, IntelliJ IDEA) автоматически читают `tsconfig.json` и поддерживают алиасы.

## Добавление новых алиасов

Если нужно добавить новый алиас:

1. Добавьте его в `tsconfig.json`:

```json
{
  "compilerOptions": {
    "paths": {
      "@utils/*": ["./utils/*"]
    }
  }
}
```

2. Перезапустите TypeScript сервер в IDE (VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server")

3. Используйте новый алиас в коде

## Устранение проблем

### Ошибка "Cannot find module"

Если TypeScript не находит модуль при использовании алиаса:

1. Проверьте правильность пути в `tsconfig.json`
2. Убедитесь, что `baseUrl` указывает на `./src`
3. Перезапустите TypeScript сервер в IDE
4. Проверьте, что указано расширение `.js` для ES модулей

### Ошибка в runtime

Если код компилируется, но падает в runtime:

1. Убедитесь, что установлен `tsconfig-paths`
2. Проверьте, что в `package.json` для `start` скрипта используется флаг `--import tsconfig-paths/register`
3. Для `tsx` в режиме разработки добавьте флаг `--tsconfig ./tsconfig.json`

## Дополнительная информация

- [TypeScript Path Mapping](https://www.typescriptlang.org/docs/handbook/module-resolution.html#path-mapping)
- [tsconfig-paths на npm](https://www.npmjs.com/package/tsconfig-paths)
- [ES Modules в Node.js](https://nodejs.org/api/esm.html)
