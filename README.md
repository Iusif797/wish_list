# Wishlist — Social Wishlist App

Сервис для создания вишлистов и совместного дарения подарков. Создавай списки желаний, делись ссылкой с друзьями — они смогут зарезервировать подарок или скинуться на него без регистрации.

---

## Стек

| Слой | Технологии |
|------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, SWR |
| **Backend** | FastAPI, SQLAlchemy 2.0 (async), Pydantic v2 |
| **База данных** | PostgreSQL (Neon Serverless) |
| **Деплой** | Vercel (frontend) + Railway (backend) |
| **Авторизация** | JWT + Google OAuth 2.0 |
| **Real-time** | WebSocket (FastAPI) |

---

## Возможности

- Регистрация / авторизация (email + Google OAuth)
- Создание нескольких вишлистов с уникальными slug-ссылками
- Добавление товаров вручную или **автоматически по URL** (парсинг og-тегов, JSON-LD, цен)
- Публичная страница `/w/{slug}` — просмотр без регистрации
- Резервирование подарков (анонимно, по токену в localStorage)
- Групповой сбор средств (contribute) с прогресс-баром
- Real-time обновления через WebSocket
- Полностью адаптивная мобильная вёрстка

---

## Локальная разработка

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # заполни DATABASE_URL и JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload
```

**Без PostgreSQL** — можно использовать SQLite. В `.env`:

```
DATABASE_URL=sqlite+aiosqlite:///./wishlist.db
```

**С PostgreSQL** — укажи URL из Neon / Supabase:

```
DATABASE_URL=postgresql+asyncpg://user:pass@host/db?sslmode=require
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local      # укажи NEXT_PUBLIC_API_URL
npm run dev
```

---

## Деплой

### 1. GitHub

```bash
git init && git add . && git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/wishlist.git
git push -u origin main
```

### 2. Neon (PostgreSQL)

1. Зарегистрируйся на [neon.tech](https://neon.tech)
2. Создай проект, скопируй **Connection string**
3. Добавь `+asyncpg` в URL: `postgresql+asyncpg://...`

### 3. Railway (бэкенд)

1. Зарегистрируйся на [railway.app](https://railway.app)
2. **New Project** → Deploy from GitHub repo
3. **Root Directory:** `backend`
4. Добавь переменные окружения:

| Переменная | Значение |
|-----------|---------|
| `DATABASE_URL` | URL из Neon |
| `JWT_SECRET` | `openssl rand -hex 32` |
| `CORS_ORIGINS` | `https://your-app.vercel.app` |
| `OAUTH_REDIRECT_URI` | `https://your-app.vercel.app/auth/callback` |
| `GOOGLE_CLIENT_ID` | *(опционально)* из Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | *(опционально)* из Google Cloud Console |

5. **Settings → Generate Domain** → получишь URL типа `https://xxx.up.railway.app`

### 4. Vercel (фронтенд)

1. Зарегистрируйся на [vercel.com](https://vercel.com)
2. **Import** из GitHub, Root Directory: `frontend`
3. Добавь переменные:

| Переменная | Значение |
|-----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://YOUR-RAILWAY-URL/api` |
| `NEXT_PUBLIC_WS_URL` | `wss://YOUR-RAILWAY-URL` |

4. **Deploy**

### 5. Google OAuth (опционально)

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials
2. Create **OAuth 2.0 Client ID** (Web application)
3. Authorized redirect URI: `https://your-app.vercel.app/auth/callback`
4. Скопируй Client ID и Client Secret в Railway

---

## Продуктовые решения

**Пустой вишлист** — плейсхолдер с иллюстрацией и CTA «Добавить первый подарок». Пользователь сразу понимает, что делать дальше, а не видит пустую страницу.

**Гость по ссылке** — просмотр, резервирование и вклад без регистрации. Анонимный токен хранится в localStorage. Нет лишнего friction для друзей — получил ссылку, зарезервировал подарок в один клик.

**Анонимные бронирования** — гости могут резервировать подарки, а владелец видит только факт бронирования, не кто именно. Решает проблему «испорченного сюрприза».

**Автозаполнение по URL** — при добавлении товара можно вставить ссылку и нажать Fetch. Бэкенд парсит og-теги, JSON-LD и текстовые паттерны, автоматически заполняя название, картинку и цену. Поддержка RUB, CZK, EUR, USD.

**Товар удалён с сайта** — резервы и вклады сохраняются. При ошибке загрузки картинки отображается плейсхолдер. Владелец может отредактировать или удалить товар.

---

## Чеклист для проверки

- [x] Регистрация и логин работают
- [x] Создание вишлиста
- [x] Добавление товара (ручное и по URL через Fetch)
- [x] Публичная ссылка `/w/{slug}`
- [x] Резерв и вклад без регистрации
- [x] Real-time обновления (WebSocket)
- [x] Мобильная адаптивность
- [x] Деплой (Vercel + Railway)

---

## Структура проекта

```
├── backend/
│   ├── app/
│   │   ├── api/          # Роутеры (auth, wishlists, meta, public, websocket)
│   │   ├── core/         # Конфиг, БД, авторизация, безопасность
│   │   ├── models/       # SQLAlchemy модели
│   │   ├── schemas/      # Pydantic схемы
│   │   ├── services/     # Бизнес-логика
│   │   └── websocket/    # WebSocket менеджер
│   ├── alembic/          # Миграции БД
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── app/              # Next.js App Router (страницы)
│   ├── components/       # Переиспользуемые компоненты
│   ├── lib/              # API-утилиты, auth-контекст
│   └── public/           # Статика (логотип, фон)
└── README.md
```
