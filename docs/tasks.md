

# Project Tasks (Derived from challenge.md)

## Backend
### Tests (TDD First)
Back-0. [x] Create Nest.js project
Back-1. [x] Write unit tests for `/chat` API (POST) <!-- challenge.md §8 -->  
Back-2. [x] Write unit tests for RouterAgent decision <!-- challenge.md §8 -->  
Back-3. [x] Write unit tests for MathAgent expressions <!-- challenge.md §8 -->  
Back-4. [x] Write E2E tests for `/chat` API <!-- challenge.md §8 -->  

### Implementation
Back-5. [x] Implement `/chat` API (POST) <!-- challenge.md §3 -->  
Back-6. [x] Create RouterAgent to decide between KnowledgeAgent and MathAgent <!-- challenge.md §2.1 -->  
Back-7. [x] Implement MathAgent for mathematical expressions <!-- challenge.md §2.3 -->  
Back-8. [x] Implement KnowledgeAgent with RAG using external content <!-- challenge.md §2.2 -->  
Back-9. [x] Add structured logs (JSON) <!-- challenge.md §6 -->  
Back-10. [x] Integrate Redis for history and logs <!-- challenge.md §7 -->  
Back-11. [x] Sanitize inputs and protect against prompt injection <!-- challenge.md §5 -->  
Back-12. [x] Handle errors without exposing exceptions <!-- challenge.md §5 -->  
Back-13. [x] Update README.md with backend features as implemented <!-- challenge.md §10 -->  

## Infraestructure
Infra-1. [ ] Prepare basic infrastructure (Docker, docker-compose, Redis, folder structure) <!-- challenge.md §7 -->  
Infra-2. [ ] Create Dockerfile for frontend and backend <!-- challenge.md §7 -->  
Infra-3. [ ] Create `docker-compose.yml` to run frontend, backend and Redis locally <!-- challenge.md §7 -->  
    - make backend run with docker
    - make frontend run with docker

Infra-4. [ ] Configure environment variables for front-backend integration <!-- challenge.md §7 -->  
Infra-5. [ ] Create Kubernetes manifests for all services <!-- challenge.md §7 -->  
Infra-6. [ ] Update README.md with infra features as implemented <!-- challenge.md §10 -->  

## Documentation
Docs-1. [ ] Write README.md according to challenge requirements <!-- challenge.md §10 -->  
Docs-2. [ ] Document: How to run the system locally (Docker + docker-compose) <!-- challenge.md §10.1 -->  
Docs-3. [ ] Document: How to run on Kubernetes (kubectl apply -f) <!-- challenge.md §10.2 -->  
Docs-4. [ ] Document: Architecture description (Router, Agents, Logs, Redis) <!-- challenge.md §10.3 -->  
Docs-5. [ ] Document: How to access the front-end and test multiple conversations <!-- challenge.md §10.4 -->  
Docs-6. [ ] Add example logs (in JSON) <!-- challenge.md §10.5 -->  
Docs-7. [ ] Document: How sanitization and prompt injection protection work  <!-- challenge.md §10.6 -->  
Docs-8. [ ] Document: How to run the tests <!-- challenge.md §10.7 -->  

## Frontend
### Tests (TDD First)
Front-0. [ ] Create Vite React.js project
Front-1. [ ] Write frontend component tests for chat interface <!-- challenge.md §8 -->  
Front-2. [ ] Write frontend component tests for multiple conversations <!-- challenge.md §8 -->  

### Implementation
Front-3. [ ] Create simple chat interface in React <!-- challenge.md §4 -->  
Front-4. [ ] Integrate with backend `/chat` API <!-- challenge.md §3, §4 -->  
- list conversations -> `GET /chats`
    (passing "user_id")

- get conversation -> `GET /chat`
    (passing "user_id" and "conversation_id")

Front-6. [ ] Show full conversation history <!-- challenge.md §4 -->  
Front-7. [ ] Show responsible agent for each response <!-- challenge.md §4 -->  
Front-8. [ ] Sanitize user inputs <!-- challenge.md §5 -->  
Front-9. [ ] Show friendly error messages <!-- challenge.md §5 -->  
Front-10. [ ] Update README.md with frontend features as implemented <!-- challenge.md §10 -->  

## Deploy
Deploy-1. [ ] Include cloud deploy instructions (Render.com, Vercel, etc.) <!-- challenge.md §11 -->  
Deploy-2. [ ] Add log and message examples <!-- challenge.md §10.5, §9 -->  
Deploy-3. [ ] Deploy to a cloud platform and document public URLs <!-- challenge.md §11 -->  
