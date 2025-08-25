# 📡 API Routes Documentation

## Overview
This document covers all implemented API routes for user management, conversation handling, and chat functionality.

## Authentication
No authentication required for this prototype. Users are identified by `user_id` and conversations by `conversation_id`.

---

## 🔗 User Management

### `POST /user`
Create a new user in the system.

**Request:**
```json
{
  "user_name": "John Doe"
}
```

**Response:**
```json
{
  "user_id": "client1234567890"
}
```

**Validation:**
- `user_name`: 2-50 characters, required, trimmed

---

## 💬 Conversation Management

### `POST /chats/new`
Create a new conversation for an existing user.

**Request:**
```json
{
  "user_id": "client1234567890"
}
```

**Response:**
```json
{
  "conversation_id": "conv-1234567890"
}
```

**Validation:**
- `user_id`: Must exist in the system
- Format: `client{timestamp}`

**Errors:**
- `404`: User not found

---

### `GET /chats?user_id={user_id}`
List all conversations for a specific user.

**Request:**
```
GET /chats?user_id=client1234567890
```

**Response:**
```json
{
  "conversations": [
    {
      "conversation_id": "conv-1234567890",
      "user_id": "client1234567890",
      "created_at": "2025-08-25T02:34:04.143Z"
    }
  ]
}
```

**Errors:**
- `400`: Invalid user_id format
- `404`: User not found

---

### `GET /chat?user_id={user_id}&conversation_id={conversation_id}`
Get a specific conversation with its full message history.

**Request:**
```
GET /chat?user_id=client1234567890&conversation_id=conv-1234567890
```

**Response:**
```json
{
  "conversation": {
    "conversation_id": "conv-1234567890",
    "user_id": "client1234567890",
    "created_at": "2025-08-25T02:34:04.143Z"
  },
  "history": [
    {
      "timestamp": "2025-08-25T02:36:27.091Z",
      "message": "Como funciona a taxa da maquininha?",
      "response": "A taxa da maquininha funciona automaticamente...",
      "source_agent_response": {...},
      "agent_workflow": [
        { "agent": "RouterAgent", "decision": "KnowledgeAgent" },
        { "agent": "KnowledgeAgent" }
      ]
    }
  ]
}
```

**Errors:**
- `400`: Invalid format for user_id or conversation_id
- `404`: Conversation not found or access denied

---

## 🤖 Chat & Messaging

### `POST /chat`
Send a message in an existing conversation and get AI response.

**Request:**
```json
{
  "message": "Como funciona a taxa da maquininha?",
  "user_id": "client1234567890", 
  "conversation_id": "conv-1234567890"
}
```

**Response:**
```json
{
  "response": "A taxa da maquininha funciona automaticamente quando a opção \"Repassar taxas para o cliente\" é ativada...",
  "source_agent_response": {
    "llm_api": "groq",
    "model": "llama-3.1-8b-instant",
    "responseMessage": {
      "role": "assistant",
      "content": "A taxa da maquininha funciona automaticamente..."
    },
    "usage": {
      "usagePercent": "12.11%",
      "remainingTokens": 907
    }
  },
  "agent_workflow": [
    { "agent": "RouterAgent", "decision": "KnowledgeAgent" },
    { "agent": "KnowledgeAgent" }
  ]
}
```

**Validation:**
- `message`: 5+ characters, required, sanitized
- `user_id`: Format `client{number}`
- `conversation_id`: Format `conv-{number}`
- Conversation must exist and belong to the user

**Features:**
- Input sanitization (removes HTML/JS)
- Prompt injection protection
- Automatic conversation history storage
- Router agent decides between KnowledgeAgent/MathAgent

**Errors:**
- `400`: Validation errors
- `403`: Prompt injection detected
- `404`: Conversation not found or access denied
- `500`: Server error

---

## 🔄 Complete Workflow Example

```bash
# 1. Create user
curl -X POST http://localhost:3003/user -H "Content-Type: application/json" -d '{"user_name": "Test User"}'
# Response: {"user_id": "client1234567890"}

# 2. Create conversation
curl -X POST http://localhost:3003/chats/new -H "Content-Type: application/json" -d '{"user_id": "client1234567890"}'
# Response: {"conversation_id": "conv-1234567890"}

# 3. Send message
curl -X POST http://localhost:3003/chat -H "Content-Type: application/json" -d '{
  "message": "Como funciona a taxa da maquininha?", 
  "user_id": "client1234567890", 
  "conversation_id": "conv-1234567890"
}'

# 4. List user conversations
curl "http://localhost:3003/chats?user_id=client1234567890"

# 5. Get conversation history
curl "http://localhost:3003/chat?user_id=client1234567890&conversation_id=conv-1234567890"
```

---

## 💾 Data Storage

All data is stored in **Redis** with the following key patterns:

```bash
users:{user_id}                    # User metadata
chats:{user_id}                   # Array of conversation IDs for user
chat:conversation:{conversation_id} # Conversation metadata
chat:history:{conversation_id}     # Array of messages and responses
```

---

## 🔧 Development Notes

- **User IDs**: Auto-generated with timestamp (`client{timestamp}`)
- **Conversation IDs**: Auto-generated with timestamp (`conv-{timestamp}`)
- **Persistence**: All conversations and messages persist in Redis
- **Isolation**: Users can only access their own conversations
- **History**: Complete message history with timestamps and agent workflow
