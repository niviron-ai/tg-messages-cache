# Telegram Messages Cache

Модуль для кеширования сообщений Telegram ботов с поддержкой CRUD операций и управления placeholder сообщениями.

## Возможности

- ✅ Кеширование сообщений Telegram по пользователям и ботам
- ✅ CRUD операции: добавление, получение, редактирование, удаление
- ✅ Поддержка placeholder сообщений для индикации прогресса
- ✅ Автоматическое управление подтверждающими сообщениями
- ✅ Исключение placeholder из основного кеша
- ✅ Хеширование идентификаторов для уникальности

## Установка

```bash
npm install @dieugene/tg-messages-cache
```

## Зависимости

- `@dieugene/key-value-db` - для хранения данных
- `@dieugene/utils` - утилиты для работы с Telegram

## Использование

```javascript
const cache = require('@dieugene/tg-messages-cache');

// Инициализация (автоматически вызывается при импорте)
cache.init();

// Добавление сообщения в кеш
await cache.add(ctx, {
    message_id: 123,
    text: 'Текст сообщения'
});

// Получение всех сообщений из кеша
const messages = await cache.get(ctx);

// Получение сообщений без placeholder
const messagesClean = await cache.get(ctx, true);

// Редактирование сообщения
await cache.edit(ctx, message_id, 'Новый текст');

// Удаление конкретного сообщения
await cache.del(ctx, message_id);

// Удаление всего кеша пользователя
await cache.del(ctx);
```

## API

### `cache.add(ctx, options)`

Добавляет сообщение в кеш.

**Параметры:**
- `ctx` - контекст Telegram бота
- `options` (опционально):
  - `message_id` - ID сообщения (по умолчанию из ctx)
  - `text` - текст сообщения (по умолчанию из ctx)

### `cache.get(ctx, excludePlaceholder)`

Получает все сообщения из кеша.

**Параметры:**
- `ctx` - контекст Telegram бота
- `excludePlaceholder` - исключить placeholder сообщения (по умолчанию false)

### `cache.edit(ctx, message_id, text)`

Редактирует текст сообщения в кеше.

**Параметры:**
- `ctx` - контекст Telegram бота
- `message_id` - ID сообщения для редактирования
- `text` - новый текст сообщения

### `cache.del(ctx, message_id)`

Удаляет сообщение из кеша.

**Параметры:**
- `ctx` - контекст Telegram бота
- `message_id` - ID сообщения (если не указан, удаляется весь кеш)

## Работа с Placeholder

### `cache.cache_and_show_progress(ctx, options)`

Кеширует сообщения и показывает прогресс через placeholder.

**Параметры:**
- `ctx` - контекст Telegram бота
- `options`:
  - `show_placeholder` - показывать placeholder (по умолчанию true)
  - `placeholder_text` - текст placeholder
  - `message_id` - ID сообщения
  - `text` - текст сообщения (может быть массивом)
  - `placeholder_message_id` - ID существующего placeholder

### `cache.put_placeholder(ctx, text)`

Создает placeholder сообщение.

**Параметры:**
- `ctx` - контекст Telegram бота
- `text` - текст placeholder (по умолчанию "✍")

### `cache.del_placeholder(ctx, message_id)`

Удаляет placeholder сообщение.

**Параметры:**
- `ctx` - контекст Telegram бота
- `message_id` - ID placeholder сообщения

### `cache.get_placeholder_message_id(ctx, cache)`

Получает ID placeholder сообщения из кеша.

**Параметры:**
- `ctx` - контекст Telegram бота
- `cache` - кеш сообщений (опционально)

### `cache.exclude_placeholder(cache)`

Исключает placeholder сообщения из массива.

**Параметры:**
- `cache` - массив сообщений

## Примеры использования

### Простое кеширование

```javascript
const { Telegraf } = require('telegraf');
const cache = require('@dieugene/tg-messages-cache');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.on('text', async (ctx) => {
    // Добавляем сообщение в кеш
    await cache.add(ctx);
    
    // Получаем историю сообщений
    const history = await cache.get(ctx, true); // без placeholder
    console.log('История:', history);
});
```

### Использование с прогрессом

```javascript
bot.command('process', async (ctx) => {
    // Начинаем процесс с показом прогресса
    await cache.cache_and_show_progress(ctx, {
        text: 'Начинаем обработку...',
        placeholder_text: '⏳ Обработка...'
    });
    
    // Выполняем длительную операцию
    await longRunningOperation();
    
    // Удаляем placeholder
    await cache.del_placeholder(ctx);
    
    await ctx.reply('Готово!');
});
```

## Структура данных

Каждое сообщение в кеше имеет структуру:

```javascript
{
    message_id: Number,  // ID сообщения в Telegram
    text: String        // Текст сообщения
}
```

Placeholder сообщения имеют специальный текст: `'<<confirmation message>>'`

## Лицензия

ISC

## Автор

Eugene Ditkovsky
