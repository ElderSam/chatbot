
# 🖥️ Frontend (React + TypeScript + Vite)

## Ambiente

**Local (Desenvolvimento):**
```
VITE_BACKEND_URL=http://localhost:3003
```
Acesse: http://localhost:3003

**Produção/Kubernetes:**
```
VITE_BACKEND_URL=/api
```
Acesse: http://chatbot.local

Use `import.meta.env.VITE_BACKEND_URL` no código para requisições à API.

## How to run

### Local Development
1. Install dependencies: `pnpm install`
2. Set environment variables in `.env`
3. Start dev server: `pnpm run dev`

### Docker, Docker Compose & Kubernetes
For all infrastructure setup (Docker, docker-compose, Kubernetes), see [infrastructure/README.md](../infrastructure/README.md)

## Features
- User onboarding (create user, localStorage)
- Home page with navigation
- Create new chat (API integration)
- Chat interface (send/receive messages)
- WhatsApp-inspired UI (colors, layout)
- All styles in CSS modules (no inline CSS)
- English language standardization
- Error handling for API responses
- Clickable links in bot messages (styled via CSS module)
- Date/time formatting (WhatsApp style)
- Sidebar with conversation history (switch between chats)

## Notes
- All styles are now in CSS modules. No inline CSS remains in any component (App, CreateChatPage, ChatPage).
- ChatPage: links in bot messages are clickable and styled via CSS module.
- Error messages are shown for failed API calls.
- Date/time formatting matches WhatsApp style.

## Next steps
- Sidebar with conversation history
- Further layout improvements

