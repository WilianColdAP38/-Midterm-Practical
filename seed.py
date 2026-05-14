# script para poblar la base de datos con los 10 videos iniciales
# se corre una vez despues de levantar la api por primera vez
# uso: python seed.py

from sqlmodel import Session, select

from db import engine
from models import Videos


# lista con los 10 videos que van a la base de datos
# las urls apuntan a los archivos que ya estan subidos en s3
videos = [
    Videos(
        titulo="Eu Amo Voce",
        descripcion="Video de la categoria musica.",
        categoria="Musica",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video1.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen1.jpg",
    ),
    Videos(
        titulo="Neo Roneo",
        descripcion="Video de la categoria musica.",
        categoria="Musica",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video2.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen2.jpg",
    ),
    Videos(
        titulo="Dentist Paradise",
        descripcion="Video de la categoria musica.",
        categoria="Musica",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video3.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen3.jpg",
    ),
    Videos(
        titulo="Max Verstappen Pole Monaco 2023",
        descripcion="Vuelta de clasificacion de Max Verstappen en el Gran Premio de Monaco 2023.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video4.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen4.jpg",
    ),
    Videos(
        titulo="Fernando Alonso Pole",
        descripcion="Vuelta de clasificacion de Fernando Alonso en Formula 1.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video5.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen5.jpg",
    ),
    Videos(
        titulo="Ayrton Senna Pole Monaco",
        descripcion="Vuelta de clasificacion de Ayrton Senna en el Gran Premio de Monaco.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video6.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen6.jpg",
    ),
    Videos(
        titulo="Neymar Skills",
        descripcion="Recopilacion de jugadas y habilidades de Neymar.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video7.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen7.jpg",
    ),
    Videos(
        titulo="Messi Skills",
        descripcion="Recopilacion de jugadas y habilidades de Lionel Messi.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video8.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen8.jpg",
    ),
    Videos(
        titulo="Cristiano Ronaldo Skills",
        descripcion="Recopilacion de jugadas y habilidades de Cristiano Ronaldo.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video9.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen9.jpg",
    ),
    Videos(
        titulo="Ayrton Senna Racing Monaco",
        descripcion="Ayrton Senna en carrera durante el Gran Premio de Monaco.",
        categoria="Deportes",
        source="https://youtubestr-elian.s3.us-east-2.amazonaws.com/videos/video10.webm",
        miniatura="https://youtubestr-elian.s3.us-east-2.amazonaws.com/miniaturas/imagen10.jpg",
    ),
]


def poblar():
    with Session(engine) as session:
        # reviso si ya hay videos para no duplicarlos si corro el script dos veces
        existentes = session.exec(select(Videos)).all()
        if existentes:
            print("La base de datos ya tiene videos, no hago nada.")
            return

        # agrego los 10 videos y guardo
        session.add_all(videos)
        session.commit()
        print("Listo, se agregaron 10 videos a la base de datos.")


if __name__ == "__main__":
    poblar()