from datetime import datetime
from enum import Enum

from sqlmodel import Field, Relationship, SQLModel


class Category(str, Enum):
    FUTBOL = "futbol"
    NBA = "nba"
    F1 = "f1"


class Video(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    categoria: Category
    duracion_segundos: int
    url_video: str
    url_miniatura: str
    canal: str = "Deportes Live"
    vistas: int = 0
    fecha_subida: datetime = Field(default_factory=datetime.now)

    comentarios: list["Comment"] = Relationship(back_populates="video")


class Comment(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    autor: str
    contenido: str
    fecha: datetime = Field(default_factory=datetime.now)
    video_id: int = Field(foreign_key="video.id")

    video: Video | None = Relationship(back_populates="comentarios")


class VideoRead(SQLModel):
    id: int
    titulo: str
    descripcion: str
    categoria: Category
    duracion_segundos: int
    url_video: str
    url_miniatura: str
    canal: str
    vistas: int
    fecha_subida: datetime


class CommentCreate(SQLModel):
    autor: str
    contenido: str


class CommentRead(SQLModel):
    id: int
    autor: str
    contenido: str
    fecha: datetime
    video_id: int