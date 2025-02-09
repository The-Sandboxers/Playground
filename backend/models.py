from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

db = SQLAlchemy()
# def get_uuid():
#     return uuid4().hex

class User(db.Model):
    __tablename__ = "users"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String(30),unique=True)
    email: Mapped[str] = mapped_column(String(345), unique=True)
    password_hash: Mapped[str] = mapped_column(String(255))
    steam_id: Mapped[Optional[str]] = mapped_column(String(17))
    
    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email, "steam_id": self.steam_id}
    
    def __repr__(self):
        return f"<User (username: {self.username}, id: {self.id}, email: {self.email}, steam_id:{self.steam_id})>"