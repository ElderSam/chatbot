# Kubernetes Deployment Guide

This directory contains Kubernetes manifests for deploying the Chatbot application.

## 📋 Prerequisites

- Kubernetes cluster (local or cloud)
- `kubectl` configured to access your cluster
- NGINX Ingress Controller (for ingress)
- Docker images built and available

## 🏗️ Architecture

The deployment includes:

- **Namespace**: `chatbot` - Isolated environment
- **Redis**: Single replica with persistent storage
- **Backend**: 2 replicas with rolling updates
- **Services**: ClusterIP services for internal communication
- **Ingress**: NGINX ingress for external access
- **ConfigMap**: Environment configuration
- **Secrets**: Optional API keys storage

## 🚀 Quick Deploy

```bash
# Navigate to k8s directory
cd backend/k8s

# Deploy everything
./deploy.sh
```

## 📋 Manual Deployment Steps

If you prefer manual deployment:

```bash
# 1. Create namespace
kubectl apply -f namespace.yaml

# 2. Apply secrets (optional, if you have API keys)
kubectl apply -f secrets.yaml

# 3. Deploy Redis
kubectl apply -f redis.yaml

# 4. Deploy Backend
kubectl apply -f backend.yaml

# 5. Deploy Ingress
kubectl apply -f ingress.yaml
```

## 🔧 Configuration

### Environment Variables

Default configuration is in `namespace.yaml` ConfigMap:
- `NODE_ENV=production`
- `REDIS_HOST=redis`
- `REDIS_PORT=6379`
- `PORT=3000`
- `REDIS_TTL=900`
- `LOG_LEVEL=info`

### API Keys (Optional)

If you have API keys, create the secret:

```bash
kubectl create secret generic chatbot-secrets \
  --from-literal=groq-api-key=your-groq-key \
  --from-literal=openai-api-key=your-openai-key \
  -n chatbot
```

Then uncomment the environment variables in `backend.yaml`.

## 🌐 Access

### Local Development

```bash
# Port forward to access locally
kubectl port-forward svc/chatbot-backend 3000:3000 -n chatbot

# Test
curl http://localhost:3000/health
```

### Production Access

Update `ingress.yaml` with your domain:

```yaml
rules:
- host: your-domain.com  # Change this
```

## 📊 Monitoring

```bash
# Check pods status
kubectl get pods -n chatbot

# Check services
kubectl get services -n chatbot

# Check ingress
kubectl get ingress -n chatbot

# View logs
kubectl logs -l app=chatbot-backend -n chatbot
kubectl logs -l app=redis -n chatbot

# Describe resources for troubleshooting
kubectl describe deployment chatbot-backend -n chatbot
kubectl describe service chatbot-backend -n chatbot
```

## 🔄 Updates

```bash
# Update deployment (after building new image)
kubectl rollout restart deployment/chatbot-backend -n chatbot

# Check rollout status
kubectl rollout status deployment/chatbot-backend -n chatbot

# Rollback if needed
kubectl rollout undo deployment/chatbot-backend -n chatbot
```

## 🧹 Cleanup

```bash
# Delete all resources
kubectl delete namespace chatbot
```

## 🐛 Troubleshooting

### Common Issues

1. **Pods not starting**
   ```bash
   kubectl describe pod <pod-name> -n chatbot
   kubectl logs <pod-name> -n chatbot
   ```

2. **Service not accessible**
   ```bash
   kubectl get endpoints -n chatbot
   kubectl describe service chatbot-backend -n chatbot
   ```

3. **Ingress not working**
   ```bash
   kubectl describe ingress chatbot-ingress -n chatbot
   # Make sure NGINX Ingress Controller is installed
   ```

### Resource Requirements

- **Redis**: 64Mi-128Mi RAM, 50m-100m CPU
- **Backend**: 256Mi-512Mi RAM, 100m-500m CPU per replica

Adjust resources in the YAML files based on your cluster capacity.
