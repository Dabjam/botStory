# 🚀 Быстрый старт

Запустите «Алгоритмический Робот» за 5 минут!

## Предварительные требования

- Docker Desktop (или Docker + Docker Compose)
- Git

## Шаги установки

### 1. Клонировать репозиторий

```bash
git clone https://github.com/Samurai2306/botStory.git
cd botStory
```

### 2. Запустить все сервисы

```bash
docker-compose up -d
```

Подождите 1-2 минуты, пока все контейнеры запустятся.

### 3. Инициализировать базу данных

```bash
# Применить миграции
docker-compose exec backend alembic upgrade head

# Создать администратора
docker-compose exec backend python scripts/create_admin.py

# Загрузить тестовые уровни
docker-compose exec backend python scripts/seed_data.py
```

### 4. Открыть приложение

- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:8000/docs

### 5. Войти как администратор

- **Email:** admin@botstory.com
- **Password:** admin123

**⚠️ Обязательно смените пароль после первого входа!**

---

## 🎮 Первые шаги

1. **Зарегистрируйте игрового аккаунта** или войдите как админ
2. **Перейдите к уровням** (кнопка "Играть" или "Уровни")
3. **Выберите уровень** "Первые шаги"
4. **Прочитайте брифинг** - узнайте о задаче
5. **Напишите код:**
   ```
   вперед
   вперед
   направо
   вперед
   ```
6. **Нажмите "Запустить"** и наблюдайте за роботом!

---

## 📚 Команды Кумир

### Базовые команды
- `вперед` - двигаться вперёд на 1 клетку
- `налево` - повернуть налево на 90°
- `направо` - повернуть направо на 90°

### Циклы
```
нц 5 раз
  вперед
кц
```
Выполнит "вперед" 5 раз.

---

## 🔧 Полезные команды

### Просмотр логов
```bash
docker-compose logs -f
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Остановить сервисы
```bash
docker-compose down
```

### Перезапустить сервисы
```bash
docker-compose restart
```

### Создать резервную копию БД
```bash
docker-compose exec postgres pg_dump -U botstory_user botstory > backup.sql
```

---

## 🛠️ Режим разработки

### Backend (локально)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend (локально)
```bash
cd frontend
npm install
npm run dev
```

---

## ❓ Проблемы?

### Порты заняты
Если порты 5432, 6379, 8000 или 5173 заняты, измените их в `docker-compose.yml`.

### Backend не запускается
```bash
docker-compose logs backend
# Проверьте, запустился ли PostgreSQL
docker-compose ps
```

### Frontend показывает ошибку подключения
Убедитесь, что backend запущен:
```bash
curl http://localhost:8000/health
```

---

## 📖 Дополнительная документация

- [API Guide](docs/API_GUIDE.md) - полное описание API
- [Deployment](docs/DEPLOYMENT.md) - production развёртывание
- [Features](docs/FEATURES.md) - список возможностей

---

## 🎉 Готово!

Теперь вы можете:
- ✅ Проходить уровни
- ✅ Создавать новые уровни (как админ)
- ✅ Общаться в чатах
- ✅ Вести дневник исследователя

Удачи в изучении программирования! 🚀
