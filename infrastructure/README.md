# Infrastructure

This directory contains all infrastructure as code (IaC) for the Chatbot project.

## 📁 Structure

```
infrastructure/
├── docker/                    # Containerization
│   ├── backend/              # Backend specific configs
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── healthcheck.js
│   └── docker-compose.yml    # Complete orchestration
├── k8s/                      # Kubernetes
│   ├── backend.yaml          # Backend deployment
│   ├── redis.yaml           # Redis deployment
│   ├── ingress.yaml         # Ingress Controller
│   ├── namespace.yaml       # Namespace
│   ├── secrets.yaml         # Secrets
│   └── deploy.sh            # Deployment script
└── README.md                # This file
```

## 🐳 Docker

### Development (Hot Reload)
```bash
# Start development environment with hot reload
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up --build

# Test
curl http://localhost:3003/health
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "user_id": "client1", "conversation_id": "conv-1"}'
```

### Production
```bash
# Start production environment
cd infrastructure/docker
docker-compose up --build

# Test
curl http://localhost:3003/health
```

**Key differences:**
- **Development**: Hot reload, volumes mounted, NODE_ENV=development
- **Production**: Compiled code in image, optimized, NODE_ENV=production

**System available:** http://localhost:3003

## ☸️ Kubernetes

### Prerequisites
- Kubernetes cluster (local or cloud)
- `kubectl` configured to access your cluster  
- NGINX Ingress Controller (for ingress)
- Docker images built and available

### Complete Deployment (Quick Start)
```bash
# 1. Build Docker image
cd chatbot/infrastructure/docker
docker build -f backend/Dockerfile -t chatbot-backend:latest ../../backend

# 2. Deploy to Kubernetes
cd ../k8s
kubectl apply -f .

# 3. Access via port-forward
kubectl port-forward svc/chatbot-backend 3000:3000 -n chatbot

# 4. Test
curl http://localhost:3000/health
```

### Deploy using scripts
```bash
# From backend directory
npm run k8s:deploy

# Or directly
cd infrastructure/k8s
./deploy.sh
```

### Manual deployment
```bash
cd infrastructure/k8s

# 1. Create namespace and secrets
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml

# 2. Deploy Redis and Backend
kubectl apply -f redis.yaml
kubectl apply -f backend.yaml

# 3. Setup ingress
kubectl apply -f ingress.yaml
```

### Check status
```bash
kubectl get all -n chatbot
kubectl get ingress -n chatbot
```

### Architecture
- **Namespace**: `chatbot` - Isolated environment
- **Redis**: Single replica with persistent storage
- **Backend**: 2 replicas with rolling updates  
- **Services**: ClusterIP services for internal communication
- **Ingress**: NGINX ingress for external access

## 🔧 Configuration

- **Docker**: Uses environment variables from `backend/config/env/`
- **K8s**: Secrets defined in `k8s/secrets.yaml`
- **Healthcheck**: Implemented for all services

## 🚀 Environments

- **Development**: `docker-compose.dev.yml` (hot reload, volumes)
- **Production**: `docker-compose.yml` (optimized) or Kubernetes
- **Testing**: Isolated containers for E2E tests

## 📋 Environment Files

```
backend/config/env/
├── .env              # Development
├── .env.production   # Production  
├── .env.test         # Testing
└── .env.example      # Template
```
