# Frontend
made with React + TypeScript + Vite

## Environment Variables

Configure the backend URL in `.env`:
```
VITE_BACKEND_URL=http://localhost:3003
```
Use `import.meta.env.VITE_BACKEND_URL` in the code for API requests.


## Implemented Features

1. **User Creation**
  - `/create-user` page with a form to create a user.
  - User is saved in `localStorage` after creation.

2. **Home Page**
  - `/` (Home) page displays a personalized message if a user exists.
  - Redirects to `/create-user` if no user is found.
  - Renders component to start a new conversation.

3. **Chat Creation**
  - Component on Home to create a new conversation.
  - Integrated with API `POST /chats/new`.
  - Redirects to chat page after creation.

4. **API Routes**
  - Standardized API routes: `/user`, `/chats/new`, `/chats`, `/chat`.
  - SPA navigation uses `/chat/:conversation_id`.


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


## How to run

1. Install dependencies: `pnpm install`
2. Set environment variables in `.env`
3. Start dev server: `pnpm run dev`

## Notes

- All styles are now in CSS modules. No inline CSS remains in any component (App, CreateChatPage, ChatPage).
- ChatPage: links in bot messages are clickable and styled via CSS module.
- Error messages are shown for failed API calls.
- Date/time formatting matches WhatsApp style.

## Next steps

- Sidebar with conversation history
- Further layout improvements

