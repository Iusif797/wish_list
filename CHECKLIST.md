# Чеклист для сдачи ТЗ

## Что нужно сделать

### 1. GitHub
- [ ] Создать репозиторий на github.com
- [ ] `git init && git add . && git commit -m "Social wishlist" && git push`

### 2. Neon (PostgreSQL)
- [ ] Зарегистрироваться на neon.tech
- [ ] Создать проект, скопировать Connection string
- [ ] Добавить `+asyncpg` в URL: `postgresql+asyncpg://...`

### 3. Railway (бэкенд)
- [ ] Зарегистрироваться на railway.app
- [ ] New Project → Deploy from GitHub repo
- [ ] Root Directory: `backend`
- [ ] Добавить переменные: DATABASE_URL, JWT_SECRET, CORS_ORIGINS, OAUTH_REDIRECT_URI
- [ ] (Опционально) GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET для OAuth
- [ ] Generate Domain, скопировать URL

### 4. Vercel (фронтенд)
- [ ] Зарегистрироваться на vercel.com
- [ ] Import из GitHub, Root Directory: `frontend`
- [ ] NEXT_PUBLIC_API_URL = https://ТВОЙ-RAILWAY-URL/api
- [ ] NEXT_PUBLIC_WS_URL = wss://ТВОЙ-RAILWAY-URL
- [ ] Deploy

### 5. CORS
- [ ] В Railway CORS_ORIGINS = https://ТВОЙ-VERCEL-URL.vercel.app
- [ ] OAUTH_REDIRECT_URI = https://ТВОЙ-VERCEL-URL.vercel.app/auth/callback

### 6. Финальная проверка
- [ ] Регистрация работает
- [ ] Логин работает
- [ ] Создание вишлиста
- [ ] Добавление товара (Fetch по URL)
- [ ] Публичная ссылка /w/[slug]
- [ ] Резерв и вклад без регистрации
- [ ] Real-time обновления

### 7. Сдача
- [ ] Ссылка на приложение
- [ ] Ссылка на GitHub
- [ ] Видео 3–5 минут
- [ ] 2–3 предложения о продуктовых решениях
- [ ] Отправить в Telegram @gptdns
