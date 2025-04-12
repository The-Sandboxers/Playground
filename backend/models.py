from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Integer, String, ForeignKey, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from typing import Optional, List

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
    games: Mapped[List["UserGame"]] = relationship(back_populates="user")
    show_pc: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    show_xbox: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    show_switch: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    def to_dict(self):
        return {"id": self.id, "username": self.username, "email": self.email, "steam_id": self.steam_id}
    
    def __repr__(self):
        return f"<User (username: {self.username}, id: {self.id}, email: {self.email}, steam_id:{self.steam_id})>"

class UserGame(db.Model):
    __tablename__ = "user_games"
    
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    igdb_id: Mapped[int] = mapped_column(Integer)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    liked_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    disliked_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    played_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    favorited_status: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    
    user: Mapped["User"] = relationship(back_populates="games")
    
    def __repr__(self):
        return f"<UserGame (id: {self.id}, user_id: {self.user_id}, igdb_id: {self.igdb_id})>"