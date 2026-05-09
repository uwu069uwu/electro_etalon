# 🤖 Electro Etalon — Telegram Bot

Отдельный бот для управления заказами через Telegram.

## Запуск

```bash
cd tg-bot
npm install
npm start
```

## Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Приветствие и список команд |
| `/orders` | Последние 10 заказов (все) |
| `/new` | Новые заказы |
| `/delivered` | Доставленные заказы |
| `/cancelled` | Отменённые заказы |
| `/stats` | Статистика и выручка |

## Инлайн-кнопки

Под каждым заказом — кнопки для быстрой смены статуса прямо в Telegram.

## .env

```
TG_TOKEN=8257997204:AAEyjAdUTi-BI7iKv9rAekZ5OXgVYtfX1hs
TG_ADMIN_CHAT_ID=6779866298
MONGO_URI=mongodb+srv://...
API_URL=http://localhost:8000/api
```

## Структура

```
tg-bot/
├── bot.js        ← главный файл бота
├── db.js         ← подключение к MongoDB + схема Order
├── .env          ← токен и настройки
├── package.json
└── README.md
```
