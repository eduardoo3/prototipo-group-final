# StudyGroup 📚

Aplicação de grupos de estudo com cronômetro, ranking, resumos e lembretes.

## Como rodar

### Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp ../.env.example .env   # edite com sua SECRET_KEY
uvicorn main:app --reload
```
API disponível em: http://localhost:8000  
Docs interativas: http://localhost:8000/docs

### Frontend
Abra `frontend/index.html` diretamente no navegador, ou sirva com qualquer servidor estático:
```bash
cd frontend
python -m http.server 3000
```

## Funcionalidades
- Cadastro e login com JWT
- Criação e entrada em grupos por ID
- Cronômetro de estudos com salvamento automático
- Ranking diário e geral por tempo de estudo
- Resumos com comentários por grupo
- Lembretes agendados por grupo
- Avatares personalizados