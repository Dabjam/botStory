# API Руководство

API документация для платформы «Алгоритмический Робот».

## Base URL

```
http://localhost:8000/api/v1
```

## Аутентификация

Все защищённые эндпоинты требуют JWT токен в заголовке:

```
Authorization: Bearer <token>
```

---

## Authentication (`/auth`)

### POST `/auth/register`

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```

**Response:** `201 Created`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

### POST `/auth/login`

Вход в систему.

**Request:** (Form Data)
```
username=user@example.com
password=password123
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer"
}
```

---

## Users (`/users`)

### GET `/users/me`

Получить профиль текущего пользователя.

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "id": 1,
  "email": "user@example.com",
  "username": "username",
  "role": "user",
  "is_active": true,
  "created_at": "2024-01-15T10:30:00"
}
```

### PATCH `/users/me`

Обновить профиль.

**Request:**
```json
{
  "username": "newusername",
  "password": "newpassword"
}
```

---

## Levels (`/levels`)

### GET `/levels`

Получить список всех активных уровней.

**Query Parameters:**
- `skip` (int, optional): Offset для пагинации
- `limit` (int, optional): Лимит результатов (default: 100)

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Первые шаги",
    "description": "Научись управлять роботом",
    "narrative": "...",
    "order": 1,
    "difficulty": 1,
    "map_data": {
      "width": 5,
      "height": 5,
      "cells": [[...]]
    },
    "is_active": true,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### GET `/levels/{level_id}`

Получить детали уровня.

**Response:** `200 OK`
```json
{
  "id": 1,
  "title": "Первые шаги",
  "narrative": "...",
  "map_data": {...},
  "golden_code": "...",  // Только для admin
  "golden_steps_count": 5  // Только для admin
}
```

### POST `/levels` 🔒 Admin Only

Создать новый уровень.

**Request:**
```json
{
  "title": "Новый уровень",
  "description": "...",
  "narrative": "...",
  "order": 4,
  "difficulty": 2,
  "map_data": {
    "width": 5,
    "height": 5,
    "cells": [[...]]
  },
  "golden_code": "вперед\nвперед",
  "golden_steps_count": 2
}
```

### GET `/levels/{level_id}/progress`

Получить прогресс пользователя для уровня.

**Response:** `200 OK`
```json
{
  "id": 1,
  "user_id": 1,
  "level_id": 1,
  "completed": true,
  "steps_count": 7,
  "attempts": 3,
  "best_steps_count": 5,
  "completed_at": "2024-01-15T11:00:00",
  "created_at": "2024-01-15T10:30:00"
}
```

### POST `/levels/{level_id}/progress`

Отправить решение уровня.

**Request:**
```json
{
  "level_id": 1,
  "user_code": "вперед\nвперед\nналево",
  "steps_count": 7
}
```

---

## Execute (`/execute`)

### POST `/execute`

Выполнить код Кумир для уровня.

**Request:**
```json
{
  "level_id": 1,
  "code": "вперед\nвперед\nнаправо\nвперед"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "reached_finish": true,
  "steps_count": 4,
  "history": [[1, 1, 0], [1, 2, 0], ...],
  "final_position": {"x": 2, "y": 4, "direction": 1},
  "error": null,
  "is_optimal": true,
  "golden_steps_count": 4
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "reached_finish": false,
  "error": "Робот врезался в стену на позиции (3, 2)"
}
```

---

## Notes (`/notes`)

### GET `/notes`

Получить заметки пользователя.

**Query Parameters:**
- `level_id` (int, optional): Фильтр по уровню

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "level_id": 1,
    "content": "Важная заметка",
    "type": "custom",
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

### POST `/notes`

Создать заметку.

**Request:**
```json
{
  "level_id": 1,
  "content": "Моя заметка",
  "type": "custom"
}
```

---

## Highlights (`/highlights`)

### GET `/highlights/level/{level_id}`

Получить выделения для уровня.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "user_id": 1,
    "level_id": 1,
    "text_fragment": "важный текст",
    "color": "yellow",
    "char_start": 100,
    "char_end": 113,
    "created_at": "2024-01-15T10:30:00"
  }
]
```

### POST `/highlights`

Создать выделение.

**Request:**
```json
{
  "level_id": 1,
  "text_fragment": "важный текст",
  "color": "red",
  "char_start": 100,
  "char_end": 113
}
```

---

## Messages (`/messages`)

### GET `/messages/level/{level_id}`

Получить сообщения чата уровня.

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "level_id": 1,
    "user_id": 2,
    "content": "Как решить этот уровень?",
    "is_spoiler": false,
    "created_at": "2024-01-15T10:30:00",
    "is_deleted": false,
    "username": "player1",
    "has_completed": true
  }
]
```

### POST `/messages`

Отправить сообщение в чат.

**Request:**
```json
{
  "level_id": 1,
  "content": "Используйте [spoiler]вперед\nвперед[/spoiler]"
}
```

**Validation:** Код без тега `[spoiler]` будет отклонён.

---

## News (`/news`)

### GET `/news`

Получить новости (публичные для всех, все для админа).

**Response:** `200 OK`
```json
[
  {
    "id": 1,
    "title": "Добро пожаловать!",
    "content": "...",
    "author_id": 1,
    "is_published": true,
    "created_at": "2024-01-15T10:30:00",
    "updated_at": "2024-01-15T10:30:00"
  }
]
```

### POST `/news` 🔒 Admin Only

Создать новость.

**Request:**
```json
{
  "title": "Новая новость",
  "content": "Содержание...",
  "is_published": true
}
```

---

## Коды ошибок

- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request (некорректные данные)
- `401` - Unauthorized (не авторизован)
- `403` - Forbidden (недостаточно прав)
- `404` - Not Found (ресурс не найден)
- `500` - Internal Server Error

---

## Interactive Documentation

Полная интерактивная документация доступна по адресу:

- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
