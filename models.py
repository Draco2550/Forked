#models.py
from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship, Mapped, mapped_column
from db import Base

class User(Base):
    __tablename__= 'user'
    id: Mapped[int] = mapped_column(Integer, primary_key=True, index= True)
    email: Mapped[str] = mapped_column(String, unique= True, nullable= False, index= True)
    password: Mapped[str] = mapped_column(String, nullable= False)
    profile: Mapped["Profile"] = relationship('Profile', back_populates= 'user', uselist=False)
    
class Profile(Base):
    __tablename__= 'profile'
    id: Mapped[int] = mapped_column(Integer, primary_key= True, index= True)
    user_id: Mapped[int] = mapped_column(ForeignKey('user.id'), nullable= False)
    height_ft: Mapped[int] = mapped_column(Integer, nullable=False, default=6)
    weight_lb: Mapped[int] = mapped_column(Integer, nullable=False, default=165)
    
    goal_type: Mapped[str] = mapped_column(String, nullable= False, default = 'maintain')
    goal_weight_lb: Mapped[int] = mapped_column(Integer, nullable= False, default= 165 )
    activity_level: Mapped[str] = mapped_column(String, nullable=False, default='medium')
    user: Mapped[User] = relationship("User", back_populates="profile")