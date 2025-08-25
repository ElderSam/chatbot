# 🚀 Kubernetes Deploy Guide

This guide covers the complete deployment of the chatbot using Kubernetes, following the requirements from `challenge.md`.

## ⚠️ **Important: Real Access**

**This Kubernetes deployment is for development/learning purposes.** For real public access, see [Cloud Deploy Guide](../../CLOUD_DEPLOY.md).

**Functional access after deployment:**
- ✅ Via `kubectl port-forward` (localhost)
- ⚠️ Via Ingress `chatbot.local` (requires complex manual setup)

---

## 📋 **Prerequisites**
- Minikube or local Kubernetes cluster
- `kubectl` installed and configured
- Docker for building images
- NGINX Ingress Controller enabled (`minikube addons enable ingress`)

---

## 1. Namespace
Create the namespace to isolate resources:
```bash
kubectl apply -f infrastructure/k8s/namespace.yaml
```

## 2. Secrets
Set up secrets for sensitive variables (e.g., passwords, API keys):
```bash
kubectl apply -f infrastructure/k8s/secrets.yaml
```

## 3. Redis
Deploy Redis:
```bash
kubectl apply -f infrastructure/k8s/redis.yaml
```
- The persistent volume ensures that dump.rdb is kept between restarts.
- To restore a backup, replace the file in the volume before starting the pod.

## 4. Backend
Deploy the backend:
```bash
kubectl apply -f infrastructure/k8s/backend.yaml
```
- Make sure `.env` variables are set as secrets or configMap.
- The backend will connect to Redis using environment variables.

## 5. Frontend
Deploy the frontend:
```bash
kubectl apply -f infrastructure/k8s/frontend.yaml
```

## 6. Ingress (Optional - Advanced Setup)
Configure access via local domain:
```bash
kubectl apply -f infrastructure/k8s/ingress.yaml

# Configure hosts (optional)
echo "$(minikube ip) chatbot.local" | sudo tee -a /etc/hosts
```
⚠️ **Note**: Ingress can be complex. Use port-forward for guaranteed access.

## 7. ✅ **Verification and Functional Access**

### Pod Status
```bash
kubectl get pods -n chatbot
# Should show all READY 1/1
```

### 🎯 **Recommended Access (Port-forward)**
```bash
# Backend
kubectl port-forward -n chatbot svc/chatbot-backend 3000:3000 &

# Frontend (in another terminal)  
kubectl port-forward -n chatbot svc/chatbot-frontend 8080:80 &
```

**Functional URLs:**
- ✅ Frontend: http://localhost:8080
- ✅ Backend Health: http://localhost:3000/health
- ✅ Backend API: http://localhost:3000/chat

### 🧪 **Functionality Test**
```bash
# 1. Health check
curl localhost:3000/health

# 2. Create user
curl -X POST localhost:3000/user \
  -H "Content-Type: application/json" \
  -d '{"user_name":"Test User"}'

# 3. Create conversation (use returned user_id)
curl -X POST localhost:3000/chats/new \
  -H "Content-Type: application/json" \
  -d '{"user_id":"CLIENT_ID"}'

# 4. Send message (use returned conversation_id)  
curl -X POST localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"user_id":"CLIENT_ID","conversation_id":"CONV_ID","message":"Hello!"}'
```

## 8. 🔧 **API Keys Setup (Optional)**

For full chat functionality:

```bash
# Delete existing secret  
kubectl delete secret -n chatbot chatbot-secrets

# Create with your real keys
kubectl create secret generic chatbot-secrets -n chatbot \
  --from-literal=GROQ_API_KEY=your_groq_key \
  --from-literal=HUGGINGFACE_API_KEY=your_huggingface_key

# Restart backend to reload
kubectl delete pod -n chatbot -l app=chatbot-backend
```

## 9. 🌐 **For Real Public Access**

**⚠️ This Kubernetes deployment is for local/development use.**

For real public URLs, use:
- **☁️ Cloud Deploy**: [Cloud Deploy Guide](../../CLOUD_DEPLOY.md)
- **🌐 Public URLs**: Render.com, Railway, Fly.io
- **🔒 Automatic HTTPS**: Included in cloud deploy

---

## 📚 **References**
- [challenge.md](../../docs/challenge.md) - Original requirements
- [Cloud Deploy Guide](../../CLOUD_DEPLOY.md) - Real public deployment  
- [Infrastructure Guide](../README.md) - Infrastructure overview

---

✅ **Kubernetes deployment complete!** For public access, go to cloud deploy.

