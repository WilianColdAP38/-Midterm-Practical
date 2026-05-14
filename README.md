# Youtubestr

Mini plataforma de videos tipo YouTube. Parcial Practico 2 - Programacion Web y Multimedia - UIDE.

## Stack

- Backend: FastAPI + SQLModel + SQLite
- Frontend: HTML, CSS y JavaScript (sin frameworks)
- Archivos de video y miniaturas alojados en AWS S3

## Como correr el proyecto

1. Crear el entorno virtual:
   python -m venv venv

2. Activar el entorno virtual (Windows):
   venv\Scripts\activate

3. Instalar dependencias:
   pip install -r requirements.txt

4. Levantar el backend:
   fastapi dev main.py

5. Poblar la base de datos con los 10 videos:
   python seed.py

6. Abrir el frontend con Five Server en frontend/index.html

## Estructura

- db.py - conexion a la base de datos
- models.py - modelos Videos y Comentarios
- main.py - app FastAPI, CORS y router
- seed.py - script que puebla la base con los 10 videos
- app/routers/videos.py - endpoints de videos, comentarios y recomendados
- frontend/ - las dos paginas, estilos y script
