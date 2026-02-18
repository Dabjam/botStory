# Полная техническая инструкция — Legend of B.O.T.

Пошаговое руководство: что запускать, чего избегать, зачем и как исправлять сбои.

---

## 1. Быстрый старт

### 1.1 Требования

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **Git**  
- Для локальной разработки: **Node.js 18+**, **Python 3.11+**

### 1.2 Минимальный запуск (Docker)

```bash
git clone https://github.com/Samurai2306/botStory.git
cd botStory
docker-compose up -d
```

Подождите 1–2 минуты, пока поднимутся контейнеры.

### 1.3 Инициализация БД (один раз)

```bash
# Миграции
docker-compose exec backend alembic upgrade head

# Администратор (рекомендуемый скрипт — без passlib)
docker-compose exec backend python scripts/create_admin_simple.py

# Тестовые уровни и новости (по желанию)
docker-compose exec backend python scripts/seed_data.py
```

### 1.4 Доступ

| Сервис | URL |
|--------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| Swagger UI | http://localhost:8000/docs |

**Учётные данные администратора:**  
- Email: `admin@botstory.com`  
- Пароль: `admin`

---

## 2. Что запускать, в каком порядке и зачем

### 2.1 Обязательный порядок при первом запуске

1. **docker-compose up -d**  
   Запускает: `postgres`, `redis`, `backend`, `frontend`.  
   Без этого ничего не работает.

2. **alembic upgrade head**  
   Создаёт/обновляет таблицы в PostgreSQL.  
   Нужно выполнять после первого клонирования и после появления новых миграций в `backend/alembic/versions/`.

3. **create_admin_simple.py**  
   Создаёт пользователя с ролью admin.  
   Без него войти в систему как админ нельзя. Пароль хэшируется через bcrypt напрямую (без passlib).

4. **seed_data.py** (опционально)  
   Добавляет тестовые уровни и новости.  
   Для пустой БД без него список уровней будет пустым.

### 2.2 Регулярные действия

| Ситуация | Действие |
|----------|----------|
| Изменили только код (backend/frontend) | `docker-compose restart backend` или `docker-compose restart frontend`. Volumes смонтированы — перезапуска достаточно. |
| Изменили зависимости (requirements.txt, package.json) или Dockerfile | `docker-compose up -d --build` для пересборки образов. |
| Добавили новую миграцию Alembic | `docker-compose exec backend alembic upgrade head`. |
| Пересоздали БД (volume удалён) | Повторить шаги 2.1: миграции → create_admin_simple → при необходимости seed_data. |

### 2.3 Локальная разработка без Docker

**Backend:**

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
# В .env или окружении указать DATABASE_URL и REDIS_URL на локальные сервисы
alembic upgrade head
python scripts/create_admin_simple.py
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

Frontend по умолчанию обращается к backend через proxy (Vite) на порт 8000; при локальном backend убедитесь, что он слушает 8000.

---

## 3. Чего не делать и почему

### 3.1 Скрипты и окружение

- **Не использовать** `create_admin.py` для создания админа.  
  Используйте **create_admin_simple.py**: он не зависит от passlib и корректно работает с современным bcrypt (избегает ошибок вида «trapped bcrypt version»).

- **Не коммитить** `.env` с реальными паролями и `SECRET_KEY`.  
  В production все секреты задаются через переменные окружения или защищённое хранилище.

- **Не выполнять** `alembic downgrade` на production без бэкапа БД.  
  Откат миграций может удалить данные.

### 3.2 Порты и сеть

- **Не менять** порта backend (8000) без изменения конфигурации frontend (proxy в `vite.config.ts` и при необходимости `VITE_API_URL` при сборке).

- **Не открывать** порты БД (5432) и Redis (6379) наружу без необходимости.  
  В production доступ только из внутренней сети или через secure tunnel.

### 3.3 Обновления

- **Не обновлять** все зависимости «одним махом» без проверки.  
  В проекте зафиксированы, например, Vite 5.x и bcrypt 4.1.2 для стабильности; обновления могут потребовать правок кода.

---

## 4. Как исправлять типичные проблемы

### 4.1 Контейнеры не поднимаются

**Симптом:** `docker-compose up -d` падает или контейнеры сразу останавливаются.

**Действия:**

- Проверить логи: `docker-compose logs backend`, `docker-compose logs frontend`, `docker-compose logs postgres`.
- Убедиться, что порты 5432, 6379, 8000, 5173 свободны (или изменить маппинг в `docker-compose.yml`).
- Проверить место на диске и права на каталоги с volumes.

### 4.2 Backend: ошибки БД / миграций

**Симптом:** при старте backend — ошибки подключения к PostgreSQL или «relation does not exist».

**Действия:**

- Убедиться, что контейнер postgres запущен: `docker-compose ps`.
- Выполнить миграции: `docker-compose exec backend alembic upgrade head`.
- Если миграции уже применялись и вы меняли модели вручную — может понадобиться новая миграция: `docker-compose exec backend alembic revision --autogenerate -m "описание"`, затем `upgrade head`.

### 4.3 Backend: bcrypt / passlib

**Симптом:** при создании админа или при логине — «trapped error reading bcrypt version» или сбои хэширования.

**Действия:**

- Использовать только `scripts/create_admin_simple.py` (прямой bcrypt).
- В коде используется `app/core/security.py` с прямым вызовом bcrypt; не подключать passlib для хэширования паролей.
- В `requirements.txt` зафиксирован `bcrypt==4.1.2`; при обновлении bcrypt возможны изменения API — проверять вызовы.

### 4.4 Frontend: не подключается к API

**Симптом:** в браузере 404 на `/api/*` или CORS-ошибки.

**Действия:**

- Проверить, что backend отвечает: `curl http://localhost:8000/health`.
- В dev режиме проверить proxy в `frontend/vite.config.ts`: запросы к `/api` должны проксироваться на `http://localhost:8000` (или на тот хост/порт, где реально работает backend).
- При сборке для production задать правильный `VITE_API_URL` (или аналог) и использовать его в `src/services/api.ts`.

### 4.5 Frontend: ошибки при установке зависимостей

**Симптом:** `npm install` падает с ошибками совместимости или сборки нативных модулей.

**Действия:**

- Проверить версию Node: `node --version` (нужен 18+).
- Очистить кэш и переустановить:  
  `cd frontend && rm -rf node_modules package-lock.json && npm install`
- В проекте используется Vite 5.x; при переходе на Vite 7+ возможны изменения конфигурации — смотреть CHANGELOG Vite.

### 4.6 Пустой список уровней / 401 Unauthorized

**Симптом:** после входа список уровней пустой или в консоли 401 на запросах к API.

**Действия:**

- Убедиться, что пользователь создан и вы вошли под ним (или под admin после `create_admin_simple.py`).
- Проверить, что в запросах уходит заголовок `Authorization: Bearer <token>` (токен после логина сохраняется в localStorage и подставляется в api-клиенте).
- Если backend перезапускали, токен остаётся валидным до истечения срока (настраивается в backend); истёкший токен — перелогиниться.

### 4.7 Ошибки после обновления кода (Docker)

**Симптом:** изменения в коде не видны в браузере или в ответах API.

**Действия:**

- Перезапустить соответствующий сервис:  
  `docker-compose restart frontend` или `docker-compose restart backend`.
- Если менялись зависимости (package.json, requirements.txt):  
  `docker-compose up -d --build` для пересборки образов.

### 4.8 Production: HTTPS, Nginx, переменные

Для развёртывания в production:

- Настроить Nginx (или аналог) как reverse proxy к frontend (статика или dev-сервер) и к backend (например, по префиксу `/api`).
- Вынести все секреты и URL в переменные окружения (или .env на сервере, не в репозитории).
- Включить HTTPS (например, Let's Encrypt).  
Подробно: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

---

## 5. Полезные команды

```bash
# Логи всех сервисов
docker-compose logs -f

# Логи одного сервиса
docker-compose logs -f backend

# Остановка
docker-compose down

# Остановка с удалением volumes (БД будет пустой при следующем up)
docker-compose down -v

# Резервная копия БД
docker-compose exec postgres pg_dump -U botstory_user botstory > backup_$(date +%Y%m%d).sql

# Восстановление из бэкапа
docker-compose exec -T postgres psql -U botstory_user botstory < backup_YYYYMMDD.sql
```

---

## 6. Ссылки на документацию

- [README.md](README.md) — краткое описание и быстрый старт.
- [QUICKSTART.md](QUICKSTART.md) — первый запуск и первые шаги в игре.
- [docs/API_GUIDE.md](docs/API_GUIDE.md) — описание эндпоинтов API.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — развёртывание на production.
- [docs/FEATURES.md](docs/FEATURES.md) — список реализованных возможностей.
- [PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md) — структура каталогов и модулей.
