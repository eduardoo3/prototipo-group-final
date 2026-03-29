# StudyGroup 📚

Aplicação de grupos de estudo com cronômetro, ranking, resumos e lembretes.

## 🛠️ Pré-requisitos

Instale na sua máquina antes de começar:

- [Git](https://git-scm.com) — para clonar o repositório
- [Python 3.10+](https://www.python.org) — marque "Add to PATH" durante a instalação
- [VS Code](https://code.visualstudio.com) — editor recomendado

---

## 📥 Clonando o repositório

Abra o terminal e rode:
```bash
git clone https://github.com/eduardoo3/prototipo-group-final.git
cd prototipo-group-final
```

---

## ⚙️ Configurando o Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
pip install "bcrypt==4.0.1"
pip install "pydantic[email]"
```

---

## 🚀 Rodando o Projeto

Você precisa de **dois terminais abertos ao mesmo tempo**.

**Terminal 1 — Backend:**
```bash
cd backend
venv\Scripts\activate
uvicorn main:app --reload --reload-exclude venv
```

**Terminal 2 — Frontend:**
```bash
cd frontend
python -m http.server 3000
```

Acesse **http://localhost:3000** no navegador. 🎉

---

## 📁 Estrutura do Projeto
```
prototipo-group-final/
├── backend/
│   ├── main.py              # Entrada da API
│   ├── database.py          # Configuração do banco de dados
│   ├── models.py            # Modelos do banco (SQLAlchemy)
│   ├── requirements.txt     # Dependências Python
│   └── routers/
│       ├── auth.py          # Login e cadastro
│       ├── groups.py        # Grupos de estudo
│       ├── sessions.py      # Sessões de estudo (cronômetro)
│       ├── summaries.py     # Resumos e comentários
│       └── reminders.py     # Lembretes
├── frontend/
│   ├── index.html           # Página principal
│   ├── css/
│   │   └── style.css        # Estilos globais
│   └── js/
│       ├── api.js           # Comunicação com o backend
│       ├── app.js           # Orquestrador principal
│       ├── auth.js          # Login e cadastro
│       ├── home.js          # Tela inicial e timer
│       ├── group.js         # Tela do grupo
│       └── timer.js         # Cronômetro
└── README.md
```

---

## ✨ Funcionalidades

- 👤 Cadastro e login com autenticação JWT
- 👥 Criação e entrada em grupos por ID
- ⏱️ Cronômetro de estudos com salvamento automático
- 🏆 Ranking diário e geral por tempo de estudo
- 📝 Resumos com comentários por grupo
- 📅 Lembretes agendados por grupo
- 🎭 Avatares personalizados

---

## 🔧 Extensões VS Code Recomendadas

- **Python** (Microsoft)
- **Live Server**
- **GitLens**

---

## 📌 Observações

- O banco de dados SQLite é criado automaticamente na primeira execução
- Cada membro precisa criar sua própria conta — os dados não são compartilhados localmente
- Para entrar no mesmo grupo, compartilhe o **ID do grupo** gerado na tela inicial