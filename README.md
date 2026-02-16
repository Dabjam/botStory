# 🤖 Алгоритмический Робот

> Футуристичная образовательная платформа для изучения программирования через решение алгоритмических задач с использованием синтаксиса языка «Кумир».

![Status](https://img.shields.io/badge/status-active-success.svg)
![Version](https://img.shields.io/badge/version-2.1-blue.svg)
![Design](https://img.shields.io/badge/design-cyberpunk-ff00ff.svg)
![3D](https://img.shields.io/badge/graphics-3D%20isometric-00ff9f.svg)

## ✨ Новое в версии 2.1

- 🤖 **3D Робот с Three.js** - полноценная интерактивная модель на главной странице
- 🎨 **Детализированный Canvas** - улучшенная графика робота в игре с множеством эффектов
- 🎮 **Minecraft Шрифт** - игровой стиль для счетчиков и статистики
- ⚡ **Premium UI** - обновленные стили всех страниц с кинематографическими эффектами
- 🚀 **Оптимизация** - исправлены зависимости и улучшена производительность

📖 **[Полный список изменений](IMPROVEMENTS.md)** | 🚀 **[Руководство по обновлению](UPDATE_GUIDE.md)**

## 🎨 Дизайн

Приложение выполнено в **футуристичном киберпанк-стиле** с:

- ✨ **Изометрической 3D графикой** (Three.js + React Three Fiber)
- 🤖 **Интерактивными 3D моделями** с orbit controls
- 🌊 **Множеством плавных анимаций** (Framer Motion)
- 💫 **Неоновыми эффектами** и glassmorphism
- 🎭 **Holographic** и sci-fi визуализацией
- ⚡ **Интерактивными элементами** с реалтайм feedback
- 🎮 **Minecraft шрифтом** для игровых элементов

> Подробнее: [FRONTEND_REDESIGN.md](FRONTEND_REDESIGN.md) | [IMPROVEMENTS.md](IMPROVEMENTS.md)

## 🏗️ Архитектура

- **Backend**: FastAPI (Python) + PostgreSQL + Redis
- **Frontend**: React + TypeScript + Vite + Framer Motion + Three.js
- **Kumir Executor**: Python-интерпретатор подмножества команд Кумир
- **Design**: Cyberpunk/Sci-Fi с изометрической графикой

## Быстрый старт

### Требования

- Docker & Docker Compose
- Node.js 18+ (для локальной разработки frontend)
- Python 3.11+ (для локальной разработки backend)

### Запуск в Docker

```bash
# Клонировать репозиторий
git clone https://github.com/Samurai2306/botStory.git
cd botStory

# Запустить все сервисы
docker-compose up -d

# Применить миграции БД
docker-compose exec backend alembic upgrade head

# Создать тестового администратора
docker-compose exec backend python scripts/create_admin.py
```

Приложение будет доступно:
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

### Локальная разработка

#### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

#### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Структура проекта

```
botStory/
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # API endpoints
│   │   ├── core/        # Config, security, deps
│   │   ├── db/          # Database models & migrations
│   │   ├── schemas/     # Pydantic schemas
│   │   └── services/    # Business logic
│   ├── kumir/           # Kumir executor
│   └── tests/
├── frontend/            # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API client
│   │   ├── store/       # State management
│   │   └── utils/       # Utilities
│   └── public/
└── docker-compose.yml
```

## Роли пользователей

- **Гость**: Просмотр лендинга и новостей
- **Игрок**: Прохождение уровней, доступ к дневнику и чатам
- **Администратор**: Создание уровней, модерация

## Разработка

### Миграции БД

```bash
# Создать миграцию
docker-compose exec backend alembic revision --autogenerate -m "description"

# Применить миграции
docker-compose exec backend alembic upgrade head

# Откатить миграцию
docker-compose exec backend alembic downgrade -1
```

### Тесты

```bash
# Backend
docker-compose exec backend pytest

# Frontend
cd frontend && npm run test
```

## Документация

- [API Documentation](http://localhost:8000/docs) - Swagger UI
- [Техническое задание](docs/TZ.md)
- [Архитектура БД](docs/DATABASE.md)
- [Руководство администратора](docs/ADMIN_GUIDE.md)

## Лицензия

MIT
