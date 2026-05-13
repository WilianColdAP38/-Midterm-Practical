from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import videos
from db import create_all_tables


app = FastAPI(
    title="Streaming Deportivo API",
    lifespan=create_all_tables,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos.router)


@app.get("/")
def root():
    return {"message": "API de Streaming Deportivo funcionando"}