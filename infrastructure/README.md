# Infrastructure Guide

## 🐳 Docker

### Development
```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up --build
```
**System:** http://localhost:3003

### Production  
```bash
cd infrastructure/docker
docker-compose up --build
```

## ☸️ Kubernetes

### Quick Deploy
```bash
# 1. Build image
cd infrastructure/docker
docker build -f backend/Dockerfile -t chatbot-backend:latest ../../backend

# 2. Deploy all
cd ../k8s
kubectl apply -f .

# 3. Access
kubectl port-forward svc/chatbot-backend 3000:3000 -n chatbot
```

**Test:** `curl http://localhost:3000/health`

## 📁 Structure

```
infrastructure/
├── docker/
│   ├── docker-compose.dev.yml    # Development (hot reload)
│   ├── docker-compose.yml        # Production
│   └── backend/Dockerfile
└── k8s/                          # Kubernetes manifests
    ├── backend.yaml
    ├── redis.yaml
    └── secrets.yaml
```
