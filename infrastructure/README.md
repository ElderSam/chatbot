# Infrastructure Guide

## 🐳 Docker

### Development
```bash
cd infrastructure/docker
docker-compose -f docker-compose.dev.yml up --build
```
## URLs de acesso

**Local (Desenvolvimento):**
http://localhost:3003 (frontend)
http://localhost:3000 (backend)

**Produção/Kubernetes:**
http://chatbot.local (frontend via Ingress)
http://chatbot.local/api (backend via Ingress)

### Production  
```bash
cd infrastructure/docker
docker-compose up --build
```


## ☸️ Kubernetes

See [Kubernetes Deploy Guide](../k8s/DEPLOY_GUIDE.md) for the full step-by-step deployment, including Redis, Backend, Frontend, and public URLs for challenge.md.

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

## Teste de saúde

**Local:**
```
curl http://localhost:3000/health
```

**Produção/Kubernetes:**
```
curl http://chatbot.local/api/health
```

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
