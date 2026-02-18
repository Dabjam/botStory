"""
Simple admin creation script using bcrypt directly
"""
import sys
sys.path.append('.')

from app.db.database import SessionLocal
from app.db.models import User, UserRole
import bcrypt


def create_admin():
    db = SessionLocal()
    
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.role == UserRole.ADMIN).first()
        if admin:
            print(f"Admin user already exists: {admin.email}")
            return
        
        # Hash password directly with bcrypt
        password = "admin"
        password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Create admin
        admin_user = User(
            email="admin@botstory.com",
            username="admin",
            password_hash=password_hash,
            role=UserRole.ADMIN,
            is_active=True
        )
        
        db.add(admin_user)
        db.commit()
        
        print("✓ Admin user created successfully!")
        print("  Email: admin@botstory.com")
        print("  Password: admin")
        print("  Please change the password after first login!")
    
    except Exception as e:
        print(f"Error creating admin: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    create_admin()
