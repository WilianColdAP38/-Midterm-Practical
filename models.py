from sqlmodel import Field, Relationship, SQLModel


class Videos(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    titulo: str
    descripcion: str
    categoria: str
    source: str
    miniatura: str
    es_publico: bool = True

    comentarios: list["Comentarios"] = Relationship(back_populates="video")


class Comentarios(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    autor: str
    contenido: str
    video_id: int = Field(foreign_key="videos.id")

    video: Videos | None = Relationship(back_populates="comentarios")


class VideosCreate(SQLModel):
    titulo: str
    descripcion: str
    categoria: str
    source: str
    miniatura: str
    es_publico: bool = True


class ComentariosCreate(SQLModel):
    autor: str
    contenido: str