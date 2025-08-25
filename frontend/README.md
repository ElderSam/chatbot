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

