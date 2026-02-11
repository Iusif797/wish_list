# Деплой по ТЗ

## Чеклист перед сдачей

- [ ] GitHub репозиторий создан и код залит
- [ ] Neon: PostgreSQL создан, DATABASE_URL получен
- [ ] Railway: бэкенд задеплоен
- [ ] Vercel: фронтенд задеплоен
- [ ] Переменные окружения настроены
- [ ] Регистрация и логин работают
- [ ] Видео 3–5 минут записано
- [ ] 2–3 предложения о продуктовых решениях подготовлены

---

## 1. GitHub

```bash
cd /Users/mamedovyusif/Desktop/test_work
git init
git add .
git commit -m "Social wishlist app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/wishlist.git
git push -u origin main
```

---

## 2. Neon (PostgreSQL)

1. Зайди на [neon.tech](https://neon.tech)
2. Создай проект
3. Скопируй `Connection string`
4. Замени `postgresql://` на `postgresql+asyncpg://` (добавь `+asyncpg` перед `://`)
5. Сохрани как `DATABASE_URL`

---

## 3. Railway (бэкенд)

1. Зайди на [railway.app](https://railway.app)
2. New Project → Deploy from GitHub repo (выбери свой репозиторий)
3. Укажи корневую папку: `backend` (Root Directory = `backend`)
4. Добавь переменные:
   - `DATABASE_URL` — из Neon
   - `JWT_SECRET` — случайная строка (openssl rand -hex 32)
   - `CORS_ORIGINS` — URL фронтенда (например https://wishlist-xxx.vercel.app)
   - `OAUTH_REDIRECT_URI` — https://ТВОЙ-ФРОНТЕНД.vercel.app/auth/callback
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` — из Google Cloud Console

5. Railway выдаст URL типа `https://xxx.up.railway.app`
6. Deploy → Settings → Generate Domain

---

## 4. Vercel (фронтенд)

1. Зайди на [vercel.com](https://vercel.com)
2. Import project из GitHub
3. Root Directory: `frontend`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = https://ТВОЙ-RAILWAY-URL/api
   - `NEXT_PUBLIC_WS_URL` = wss://ТВОЙ-RAILWAY-URL (с wss вместо https)

5. Deploy

---

## 5. Google OAuth (опционально)

1. [console.cloud.google.com](https://console.cloud.google.com) → APIs → Credentials
2. Create OAuth 2.0 Client ID (Web application)
3. Authorized redirect URIs: `https://ТВОЙ-ФРОНТЕНД.vercel.app/auth/callback`
4. Скопируй Client ID и Client Secret в Railway

---

## 6. Локальная разработка без PostgreSQL

В `backend/.env`:
```
DATABASE_URL=sqlite+aiosqlite:///./wishlist.db
```

Запуск:
```bash
cd backend
source venv/bin/activate
alembic upgrade head
uvicorn app.main:app --reload
```
