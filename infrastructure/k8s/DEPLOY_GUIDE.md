# 🚀 Kubernetes Deploy Guide

Este guia cobre o deploy completo do chatbot usando Kubernetes, seguindo os requisitos do `challenge.md`.

## ⚠️ **Importante: Acesso Real**

**Este deploy Kubernetes é para desenvolvimento/aprendizado.** Para acesso público real, veja [Cloud Deploy Guide](../../CLOUD_DEPLOY.md).

**Acesso funcional após deploy:**
- ✅ Via `kubectl port-forward` (localhost)
- ⚠️ Via Ingress `chatbot.local` (requer configuração manual complexa)

---

## 📋 **Pré-requisitos**
- Minikube ou cluster Kubernetes local
- `kubectl` instalado e configurado
- Docker para build das imagens
- NGINX Ingress Controller habilitado (`minikube addons enable ingress`)

---

## 1. Namespace
Crie o namespace para isolar os recursos:
```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
```

## 2. Secrets
Configure secrets para variáveis sensíveis (ex: senhas, API keys):
```bash
kubectl apply -f infrastructure/k8s/secrets.yaml
```

## 3. Redis
Deploy do Redis:
```bash
kubectl apply -f infrastructure/k8s/redis.yaml
```
- O volume persistente garante que o dump.rdb seja mantido entre reinicializações.
- Para restaurar um backup, substitua o arquivo no volume antes de subir o pod.

## 4. Backend
Deploy do backend:
```bash
kubectl apply -f infrastructure/k8s/backend.yaml
```
- Certifique-se que as variáveis do `.env` estejam configuradas como secrets ou configMap.
- O backend irá se conectar ao Redis usando as variáveis de ambiente.

## 5. Frontend
Deploy do frontend:
```bash
kubectl apply -f infrastructure/k8s/frontend.yaml
```

## 6. Ingress (Opcional - Configuração Avançada)
Configure o acesso via domínio local:
```bash
kubectl apply -f infrastructure/k8s/ingress.yaml

# Configure hosts (opcional)
echo "$(minikube ip) chatbot.local" | sudo tee -a /etc/hosts
```
⚠️ **Nota**: Ingress pode ser complexo. Use port-forward para acesso garantido.

## 7. ✅ **Verificação e Acesso Funcional**

### Status dos Pods
```bash
kubectl get pods -n chatbot
# Deve mostrar todos READY 1/1
```

### 🎯 **Acesso Recomendado (Port-forward)**
```bash
# Backend
kubectl port-forward -n chatbot svc/chatbot-backend 3000:3000 &

# Frontend (em outro terminal)  
kubectl port-forward -n chatbot svc/chatbot-frontend 8080:80 &
```

**URLs funcionais:**
- ✅ Frontend: http://localhost:8080
- ✅ Backend Health: http://localhost:3000/health
- ✅ Backend API: http://localhost:3000/chat

### 🧪 **Teste de Funcionalidade**
```bash
# 1. Health check
curl localhost:3000/health

# 2. Criar usuário
curl -X POST localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Test User"}'

# 3. Criar conversa (use user_id retornado)
curl -X POST localhost:3000/chats/new \
  -H "Content-Type: application/json" \
  -d '{"user_id":"CLIENT_ID"}'

# 4. Enviar mensagem (use conversation_id retornado)  
curl -X POST localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id":"CLIENT_ID","conversation_id":"CONV_ID","message":"Hello!"}'
```

## 8. 🔧 **Configuração de API Keys (Opcional)**

Para funcionalidade completa do chat:

```bash
# Delete secret existente  
kubectl delete secret -n chatbot chatbot-secrets

# Crie com suas chaves reais
kubectl create secret generic chatbot-secrets -n chatbot \
  --from-literal=GROQ_API_KEY=sua_chave_groq \
  --from-literal=HUGGINGFACE_API_KEY=sua_chave_huggingface

# Reinicie backend para carregar
kubectl delete pod -n chatbot -l app=chatbot-backend
```

## 9. 🌐 **Para Acesso Público Real**

**⚠️ Este deploy Kubernetes é local/desenvolvimento.**

Para URLs públicas reais, use:
- **☁️ Cloud Deploy**: [Cloud Deploy Guide](../../CLOUD_DEPLOY.md)
- **🌐 URLs públicas**: Render.com, Railway, Fly.io
- **🔒 HTTPS automático**: Incluso no cloud deploy

---

## 📚 **Referências**
- [challenge.md](../../docs/challenge.md) - Requisitos originais
- [Cloud Deploy Guide](../../CLOUD_DEPLOY.md) - Deploy público real  
- [Infrastructure Guide](../README.md) - Visão geral de infraestrutura

---

✅ **Deploy Kubernetes completo!** Para acesso público, vá para cloud deploy.
