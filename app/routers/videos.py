from random import sample

from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from db import SessionDep
from models import Videos, VideosCreate, Comentarios, ComentariosCreate


router = APIRouter(prefix="/videos", tags=["Videos"])


@router.get("/")
def get_videos(session: SessionDep, categoria: str | None = None):
    query = select(Videos)

    if categoria:
        query = query.where(Videos.categoria == categoria)

    return session.exec(query).all()


@router.get("/{video_id}")
def get_video_by_id(video_id: int, session: SessionDep):
    video_db = session.get(Videos, video_id)

    if not video_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )

    return video_db


@router.post("/")
def create_video(video_data: VideosCreate, session: SessionDep):
    video = Videos.model_validate(video_data.model_dump())

    session.add(video)
    session.commit()
    session.refresh(video)

    return video


@router.get("/{video_id}/comentarios")
def get_comentarios(video_id: int, session: SessionDep):
    video_db = session.get(Videos, video_id)

    if not video_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )

    return session.exec(
        select(Comentarios).where(Comentarios.video_id == video_id)
    ).all()


@router.post("/{video_id}/comentarios")
def create_comentario(video_id: int, comentario_data: ComentariosCreate, session: SessionDep):
    video_db = session.get(Videos, video_id)

    if not video_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )

    comentario = Comentarios(
        autor=comentario_data.autor,
        contenido=comentario_data.contenido,
        video_id=video_id
    )

    session.add(comentario)
    session.commit()
    session.refresh(comentario)

    return comentario


@router.get("/{video_id}/recomendados")
def get_recomendados(video_id: int, session: SessionDep):
    video_db = session.get(Videos, video_id)

    if not video_db:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="El video no fue encontrado"
        )

    videos = session.exec(
        select(Videos).where(Videos.id != video_id)
    ).all()

    if len(videos) <= 10:
        return videos

    return sample(videos, 10)