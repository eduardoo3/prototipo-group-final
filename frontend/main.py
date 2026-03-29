from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import auth, groups, sessions, summaries, reminders

Base.metadata.create_all(bind=engine)

app = FastAPI(title='StudyGroup API', version='1.0.0')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:3000'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

app.include_router(auth.router)
app.include_router(groups.router)
app.include_router(sessions.router)
app.include_router(summaries.router)
app.include_router(reminders.router)

@app.get('/')
def root():
    return {'message': 'StudyGroup API online'}