#models.py
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from db import db

class User(db.Model):
    __tablename__= 'user'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index= True)
    email: Mapped[str] = mapped_column(String, unique= True, nullable= False, index= True)
    password: Mapped[str] = mapped_column(String, nullable= False)
    profile: Mapped["Profile"] = relationship('Profile', back_populates= 'user', uselist=False)
    
class Profile(db.Model):
    __tablename__= 'profile'
    
    id: Mapped[int] = mapped_column(Integer, primary_key= True, index= True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable= False)
    height_in: Mapped[int] = mapped_column(Integer, nullable=False)
    weight_lb: Mapped[int] = mapped_column(Integer, nullable=False)
    gender: Mapped[str| None] = mapped_column(String, nullable= False)
    goal_type: Mapped[str] = mapped_column(String, nullable= False, default = 'maintain')
    goal_weight_lb: Mapped[int] = mapped_column(Integer, nullable= False )
    activity_level: Mapped[str] = mapped_column(String, nullable=False, default='medium')
    user: Mapped[User] = relationship("User", back_populates="profile")