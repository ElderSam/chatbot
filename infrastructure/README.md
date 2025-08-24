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

### Local Development (Quick Start)
```bash
# 1. Clone and start
git clone <repository-url>
cd chatbot/infrastructure/docker
docker-compose up --build

# 2. Test
curl http://localhost:3000/health
```

**System available:** http://localhost:3000

### Additional commands
```bash
# From project root
cd infrastructure/docker
docker-compose up

# Build backend only (from backend/)
npm run docker:build
```

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

- **Development**: `docker-compose.yml`
- **Production**: Kubernetes configs
- **Testing**: Can use isolated containers
