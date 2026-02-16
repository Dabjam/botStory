"""
Seed database with sample data
Usage: python scripts/seed_data.py
"""
import sys
sys.path.append('.')

from app.db.database import SessionLocal
from app.db.models import Level, News, User, UserRole
from app.core.security import get_password_hash


def seed_levels(db):
    """Create sample levels"""
    levels = [
        {
            "title": "Первые шаги",
            "description": "Научись управлять роботом",
            "narrative": """
Добро пожаловать, исследователь!

Перед тобой робот, который умеет выполнять простые команды.
Твоя задача - довести робота до финиша, используя команды:
- вперед - шаг вперёд
- налево - поворот налево
- направо - поворот направо

Робот начинает движение с зелёной клетки и должен достичь золотой.
Удачи!
""",
            "order": 1,
            "difficulty": 1,
            "map_data": {
                "width": 5,
                "height": 5,
                "cells": [
                    ["empty", "empty", "empty", "empty", "empty"],
                    ["empty", "start", "empty", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "finish", "empty", "empty"]
                ]
            },
            "golden_code": "вперед\nвперед\nнаправо\nвперед",
            "golden_steps_count": 4
        },
        {
            "title": "Обход препятствий",
            "description": "Научись обходить стены",
            "narrative": """
Внимание! На твоём пути появились препятствия!

Чёрные клетки - это стены. Робот не может пройти через них.
Тебе нужно найти путь в обход.

Помни: иногда самый короткий путь - не прямая линия.
""",
            "order": 2,
            "difficulty": 2,
            "map_data": {
                "width": 6,
                "height": 6,
                "cells": [
                    ["empty", "empty", "empty", "empty", "empty", "empty"],
                    ["empty", "start", "empty", "wall", "empty", "empty"],
                    ["empty", "empty", "empty", "wall", "empty", "empty"],
                    ["empty", "wall", "wall", "wall", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "finish", "empty", "empty", "empty"]
                ]
            },
            "golden_code": "направо\nвперед\nвперед\nвперед\nвперед\nналево\nвперед\nвперед\nналево\nвперед\nвперед",
            "golden_steps_count": 11
        },
        {
            "title": "Сила цикла",
            "description": "Используй циклы для оптимизации кода",
            "narrative": """
Исследователь, пришло время узнать о циклах!

Вместо того чтобы писать "вперед" много раз, можно использовать:
нц 5 раз
  вперед
кц

Это выполнит команду "вперед" 5 раз подряд.
Используй циклы, чтобы сделать код короче!
""",
            "order": 3,
            "difficulty": 3,
            "map_data": {
                "width": 8,
                "height": 4,
                "cells": [
                    ["empty", "start", "empty", "empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty", "empty", "empty", "empty"],
                    ["empty", "empty", "empty", "empty", "empty", "empty", "finish", "empty"]
                ]
            },
            "golden_code": "нц 6 раз\n  вперед\nкц\nнаправо\nнц 2 раз\n  вперед\nкц",
            "golden_steps_count": 8
        }
    ]
    
    for level_data in levels:
        existing = db.query(Level).filter(Level.order == level_data["order"]).first()
        if not existing:
            level = Level(**level_data)
            db.add(level)
    
    db.commit()
    print(f"✓ Создано {len(levels)} уровней")


def seed_news(db):
    """Create sample news"""
    admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
    
    if not admin:
        print("! Не найден администратор. Создайте админа сначала.")
        return
    
    news_items = [
        {
            "title": "Добро пожаловать в Алгоритмический Робот!",
            "content": """
Приветствуем вас на образовательной платформе для изучения программирования!

Здесь вы научитесь:
- Основам алгоритмического мышления
- Программированию на языке Кумир
- Решению логических задач

Начните с первого уровня и постепенно продвигайтесь вперёд!
""",
            "author_id": admin.id,
            "is_published": True
        },
        {
            "title": "Советы новичкам",
            "content": """
1. Внимательно читайте предысторию каждого уровня
2. Используйте маркер для выделения важной информации
3. Делайте заметки в дневнике
4. Не бойтесь экспериментировать с кодом
5. Обсуждайте решения в чате, но не публикуйте готовый код без тега [spoiler]

Удачи в прохождении!
""",
            "author_id": admin.id,
            "is_published": True
        }
    ]
    
    for news_data in news_items:
        existing = db.query(News).filter(News.title == news_data["title"]).first()
        if not existing:
            news = News(**news_data)
            db.add(news)
    
    db.commit()
    print(f"✓ Создано {len(news_items)} новостей")


def main():
    db = SessionLocal()
    
    try:
        print("Заполнение базы данных тестовыми данными...")
        seed_levels(db)
        seed_news(db)
        print("\n✓ База данных успешно заполнена!")
    except Exception as e:
        print(f"Ошибка: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    main()
