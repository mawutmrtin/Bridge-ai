# ClassBridge AI Labs

**Tagline:** Learn by doing. Understand by exploring.

A mobile-first early prototype for interactive practical learning. It demonstrates three activities:
- Primary mathematics: fraction builder
- Primary science: water-cycle explorer
- Secondary chemistry: conceptual vinegar and baking soda reaction model

## Run the frontend

### Quickest option
Open `frontend/index.html` in a modern browser. The core interactive simulations, quiz feedback, teacher dashboard, and local progress storage work without a backend.

### Recommended option (for offline/PWA testing)
Service workers require `localhost` or HTTPS. With Python installed, from the project root run:

```bash
python -m http.server 8000 --directory frontend
```

Then visit `http://localhost:8000`.

The app shell is cached after first load when served over localhost/HTTPS. Progress is saved in browser `localStorage` on the same device/browser. This is not cross-device synchronization.

## Run the starter API

```bash
cd backend
python -m venv .venv
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

API docs: `http://127.0.0.1:8000/docs`

The frontend demo currently works independently. The API is a separate starter service and is not yet wired into the UI.

## Architecture status

| Component | Status in this build |
|---|---|
| Responsive learner interface | Implemented |
| Three interactive prototype simulations | Implemented with deterministic demo logic |
| Built-in tutoring prompts | Rule-based demo guidance, not a live AI model |
| Quiz feedback and local progress | Implemented |
| Teacher progress dashboard | Implemented from local browser data |
| PWA shell cache | Included; serve via localhost/HTTPS |
| FastAPI routes | Starter routes implemented |
| PostgreSQL persistence | Not connected |
| Authentication, roles and permissions | Not implemented |
| Live AI with approved-content retrieval | Not connected |
| Multi-device/offline synchronization | Not implemented |

## Important product safeguards

- These activities are illustrative prototypes, not substitutes for supervised physical experiments.
- Curriculum mapping and grade-level suitability must be reviewed against official syllabus outcomes by South Sudanese educators before classroom deployment.
- The chemistry activity uses qualitative conceptual logic only; it does not predict real laboratory measurements.
- Do not place AI API keys in frontend code. Configure any AI provider on the server, use educator-reviewed source material, and evaluate outputs for accuracy and age suitability.
- The teacher dashboard is local demo data, not a secure school records system.

## Suggested next engineering steps

1. Review activities with teachers and map them to official curriculum outcomes.
2. Add PostgreSQL models and migrations for users, curriculum items, activities, assignments and results.
3. Implement authentication, teacher/learner roles, consent and access control.
4. Connect the frontend to the FastAPI routes.
5. Add a server-side AI tutor grounded in approved materials and tested for accuracy.
6. Implement safe sync conflict handling and test offline behavior on target low-cost Android devices.
7. Run a supervised usability pilot with school permission and appropriate consent.

## Folder structure

```text
classbridge-ai-labs/
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── app.js
│   ├── manifest.json
│   └── service-worker.js
├── backend/
│   ├── main.py
│   └── requirements.txt
└── README.md
```
