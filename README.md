# Social Wishlist

## Локальная разработка

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # venv\Scripts\activate на Windows
pip install -r requirements.txt
cp .env.example .env
```

**Без PostgreSQL** — в `.env` добавь:
```
DATABASE_URL=sqlite+aiosqlite:///./wishlist.db
```

**С PostgreSQL** — укажи свой `DATABASE_URL` из Neon/Supabase.

```bash
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Деплой

Пошаговая инструкция в [DEPLOY.md](DEPLOY.md).
