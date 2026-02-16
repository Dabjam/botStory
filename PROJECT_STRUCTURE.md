# Структура проекта

```
botStory/
│
├── backend/                          # FastAPI Backend
│   ├── app/
│   │   ├── api/
│   │   │   └── v1/
│   │   │       ├── endpoints/        # API эндпоинты
│   │   │       │   ├── auth.py      # Регистрация, вход
│   │   │       │   ├── users.py     # Управление пользователями
│   │   │       │   ├── levels.py    # CRUD уровней
│   │   │       │   ├── notes.py     # Заметки
│   │   │       │   ├── highlights.py # Выделения
│   │   │       │   ├── messages.py  # Чат
│   │   │       │   ├── news.py      # Новости
│   │   │       │   └── execute.py   # Выполнение кода
│   │   │       └── router.py        # Главный роутер
│   │   │
│   │   ├── core/
│   │   │   ├── config.py            # Настройки приложения
│   │   │   ├── security.py          # JWT, хэширование
│   │   │   └── deps.py              # Dependency injection
│   │   │
│   │   ├── db/
│   │   │   ├── database.py          # Подключение к БД
│   │   │   └── models.py            # SQLAlchemy модели
│   │   │
│   │   ├── schemas/                 # Pydantic схемы
│   │   │   ├── user.py
│   │   │   ├── level.py
│   │   │   ├── note.py
│   │   │   ├── highlight.py
│   │   │   ├── message.py
│   │   │   └── news.py
│   │   │
│   │   └── main.py                  # Главный файл приложения
│   │
│   ├── kumir/
│   │   ├── __init__.py
│   │   └── executor.py              # Интерпретатор Кумир
│   │
│   ├── alembic/                     # Миграции БД
│   │   ├── env.py
│   │   └── versions/
│   │
│   ├── scripts/
│   │   ├── create_admin.py         # Создание админа
│   │   └── seed_data.py            # Тестовые данные
│   │
│   ├── requirements.txt            # Python зависимости
│   ├── alembic.ini                 # Конфигурация Alembic
│   └── Dockerfile                  # Docker образ
│
├── frontend/                        # React Frontend
│   ├── src/
│   │   ├── components/             # React компоненты
│   │   │   ├── Layout.tsx          # Основной layout
│   │   │   ├── IsometricCanvas.tsx # Игровое поле
│   │   │   ├── CodeEditor.tsx      # IDE
│   │   │   ├── Diary.tsx           # Дневник
│   │   │   ├── LevelChat.tsx       # Чат уровня
│   │   │   └── Debriefing.tsx      # Результаты
│   │   │
│   │   ├── pages/                  # Страницы
│   │   │   ├── Landing.tsx         # Главная
│   │   │   ├── Login.tsx           # Вход
│   │   │   ├── Register.tsx        # Регистрация
│   │   │   ├── LevelHub.tsx        # Выбор уровней
│   │   │   ├── Briefing.tsx        # Предыстория
│   │   │   ├── GamePlay.tsx        # Игровой экран
│   │   │   ├── Profile.tsx         # Профиль
│   │   │   └── AdminPanel.tsx      # Админ-панель
│   │   │
│   │   ├── services/
│   │   │   └── api.ts              # API клиент (axios)
│   │   │
│   │   ├── store/
│   │   │   └── authStore.ts        # Zustand store
│   │   │
│   │   ├── App.tsx                 # Главный компонент
│   │   ├── main.tsx                # Entry point
│   │   └── index.css               # Глобальные стили
│   │
│   ├── public/                     # Статические файлы
│   ├── package.json                # Node зависимости
│   ├── vite.config.ts              # Vite конфигурация
│   ├── tsconfig.json               # TypeScript конфигурация
│   └── Dockerfile                  # Docker образ
│
├── docs/                           # Документация
│   ├── API_GUIDE.md               # API документация
│   ├── DEPLOYMENT.md              # Деплой инструкции
│   └── FEATURES.md                # Список возможностей
│
├── docker-compose.yml             # Docker Compose конфигурация
├── .gitignore                     # Git ignore
├── README.md                      # Основное описание
├── QUICKSTART.md                  # Быстрый старт
└── PROJECT_STRUCTURE.md           # Этот файл

```

## Модели базы данных

### User
- Пользователи системы
- Роли: guest, user, admin
- JWT аутентификация

### Level
- Игровые уровни
- Карта (JSON), нарратив, эталонный код
- Порядок, сложность

### LevelProgress
- Прогресс пользователя по уровням
- Завершено, количество шагов, попытки
- Лучший результат

### Note
- Заметки пользователей
- Типы: highlight, custom, template
- Привязка к уровням

### Highlight
- Выделения текста маркером
- Цвета: red, yellow, green
- Позиции в тексте

### Message
- Сообщения в чатах уровней
- Флаг is_spoiler
- Soft delete

### News
- Новости платформы
- Только для админов
- Публикация/черновик

## API эндпоинты

### Публичные
- POST `/api/v1/auth/register` - Регистрация
- POST `/api/v1/auth/login` - Вход
- GET `/api/v1/news` - Новости

### Защищённые (User)
- GET `/api/v1/users/me` - Профиль
- GET `/api/v1/levels` - Список уровней
- POST `/api/v1/execute` - Выполнение кода
- GET/POST `/api/v1/notes` - Заметки
- GET/POST `/api/v1/highlights` - Выделения
- GET/POST `/api/v1/messages/level/{id}` - Чат

### Только Admin
- POST `/api/v1/levels` - Создание уровня
- PATCH `/api/v1/levels/{id}` - Редактирование
- DELETE `/api/v1/messages/{id}` - Модерация чата
- POST `/api/v1/news` - Создание новости

## Роутинг Frontend

```
/                       → Landing (публичная)
/login                  → Login (публичная)
/register               → Register (публичная)
/levels                 → LevelHub (защищённая)
/level/:id/briefing     → Briefing (защищённая)
/level/:id/play         → GamePlay (защищённая)
/profile                → Profile (защищённая)
/admin                  → AdminPanel (только admin)
```

## Технологический стек

### Backend
- **Framework:** FastAPI 0.109
- **ORM:** SQLAlchemy 2.0
- **Migration:** Alembic 1.13
- **Validation:** Pydantic 2.5
- **Auth:** python-jose (JWT)
- **Password:** passlib + bcrypt

### Frontend
- **Framework:** React 18
- **Language:** TypeScript 5
- **Build:** Vite 5
- **State:** Zustand 4
- **HTTP:** Axios 1.6
- **Editor:** CodeMirror 6
- **Router:** React Router 6

### Database & Cache
- **DB:** PostgreSQL 15
- **Cache:** Redis 7

### DevOps
- **Container:** Docker + Docker Compose
- **Web Server:** Nginx (production)
- **SSL:** Let's Encrypt

## Порты по умолчанию

- `5173` - Frontend (Vite dev server)
- `8000` - Backend (FastAPI)
- `5432` - PostgreSQL
- `6379` - Redis

## Переменные окружения

Основные переменные в `.env`:

```
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
SECRET_KEY=your-secret-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

## Команды разработки

```bash
# Backend
cd backend
uvicorn app.main:app --reload

# Frontend
cd frontend
npm run dev

# Migrations
alembic revision --autogenerate -m "message"
alembic upgrade head

# Tests (в будущем)
pytest
npm test
```

## Ключевые файлы

- `docker-compose.yml` - Конфигурация всех сервисов
- `backend/app/main.py` - Entry point backend
- `frontend/src/App.tsx` - Entry point frontend
- `backend/kumir/executor.py` - Интерпретатор Кумир
- `backend/app/db/models.py` - Модели БД
- `frontend/src/services/api.ts` - API клиент

---

Создано с ❤️ для изучения программирования
