

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
Back-14. [x] Create routes to integrate with frontend <!-- challenge.md §4 -->  
- list conversations -> `GET /chats`
    (receive "user_id")

- get conversation -> `GET /chat`
    (receive "user_id" and "conversation_id")

## Infrastructure
Infra-1. [x] Prepare basic infrastructure (Docker, docker-compose, Redis, folder structure) <!-- challenge.md §7 -->  
Infra-2. [x] Create Dockerfile for frontend and backend <!-- challenge.md §7 -->  
Infra-3. [x] Create `docker-compose.yml` to run frontend, backend and Redis locally <!-- challenge.md §7 -->  
    - [x] backend runs with docker  
    - [ ] frontend runs with docker

Infra-4. [ ] Configure environment variables for front-backend integration <!-- challenge.md §7 -->  
Infra-5. [x] Create Kubernetes manifests for all services <!-- challenge.md §7 -->  
Infra-6. [x] Organize infrastructure in dedicated `/infrastructure` folder <!-- Best practices -->  
Infra-7. [x] Update README.md with infra features as implemented <!-- challenge.md §10 -->  

## Documentation
Docs-1. [ ] Write README.md according to challenge requirements <!-- challenge.md §10 -->  
    - [x] Docs-2: How to run locally (Docker + docker-compose) - delegated to Infrastructure Guide
    - [x] Docs-3: How to run on Kubernetes - delegated to Infrastructure Guide  
    - [x] Docs-4: Architecture description (Router, Agents, Logs, Redis) - present in diagram
    - [ ] Docs-5: How to access front-end and test multiple conversations - PENDING (no frontend yet)
    - [ ] Docs-6: Example logs (in JSON) - MISSING from main README
    - [x] Docs-7: How sanitization works - delegated to security docs
    - [x] Docs-8: How to run tests - delegated to backend README  

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
Deploy-1. [ ] Include cloud deploy instructions (Render.com, Vercel, etc.) <!-- challenge.md §11 --> OPTIONAL
Deploy-2. [x] Add log and message examples <!-- challenge.md §10.5, §9 --> PARTIAL: Security docs have examples, missing Docs-6 JSON logs in README
Deploy-3. [ ] Deploy to a cloud platform and document public URLs <!-- challenge.md §11 --> OPTIONAL  
