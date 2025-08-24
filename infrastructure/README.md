# Infrastructure

Este diretório contém toda a infraestrutura como código (IaC) para o projeto Chatbot.

## 📁 Estrutura

```
infrastructure/
├── docker/                    # Containerização
│   ├── backend/              # Configs específicas do backend
│   │   ├── Dockerfile
│   │   ├── .dockerignore
│   │   └── healthcheck.js
│   └── docker-compose.yml    # Orquestração completa
├── k8s/                      # Kubernetes
│   ├── backend.yaml          # Deploy backend
│   ├── redis.yaml           # Deploy Redis
│   ├── ingress.yaml         # Ingress Controller
│   ├── namespace.yaml       # Namespace
│   ├── secrets.yaml         # Secrets
│   └── deploy.sh            # Script de deploy
└── README.md                # Este arquivo
```

## 🐳 Docker

### Desenvolvimento Local (Quick Start)
```bash
# 1. Clone and start
git clone <repository-url>
cd chatbot/infrastructure/docker
docker-compose up --build

# 2. Test
curl http://localhost:3000/health
```

**System available:** http://localhost:3000

### Comandos adicionais
```bash
# A partir da raiz do projeto
cd infrastructure/docker
docker-compose up

# Build apenas do backend (a partir do backend/)
npm run docker:build
```

## ☸️ Kubernetes

### Prerequisites
- Kubernetes cluster (local or cloud)
- `kubectl` configured to access your cluster  
- NGINX Ingress Controller (for ingress)
- Docker images built and available

### Deploy completo (Quick Start)
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

### Deploy usando scripts
```bash
# A partir do backend
npm run k8s:deploy

# Ou diretamente
cd infrastructure/k8s
./deploy.sh
```

### Deploy manual
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

### Verificar status
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

## 🔧 Configurações

- **Docker**: Usa as variáveis de ambiente de `backend/config/env/`
- **K8s**: Secrets definidos em `k8s/secrets.yaml`
- **Healthcheck**: Implementado para todos os serviços

## 🚀 Ambientes

- **Development**: `docker-compose.yml`
- **Production**: Kubernetes configs
- **Testing**: Pode usar containers isolados
