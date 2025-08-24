#!/bin/bash

# Deploy Chatbot to Kubernetes
# This script applies all Kubernetes resources in the correct order

set -e

echo "🚀 Deploying Chatbot to Kubernetes..."

# Create namespace first
echo "📦 Creating namespace..."
kubectl apply -f namespace.yaml

# Apply ConfigMap and Secrets
echo "⚙️ Applying configuration..."
kubectl apply -f secrets.yaml

# Deploy Redis
echo "🗄️ Deploying Redis..."
kubectl apply -f redis.yaml

# Wait for Redis to be ready
echo "⏳ Waiting for Redis to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/redis -n chatbot

# Deploy Backend
echo "🤖 Deploying Chatbot Backend..."
kubectl apply -f backend.yaml

# Wait for Backend to be ready
echo "⏳ Waiting for Backend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/chatbot-backend -n chatbot

# Deploy Ingress
echo "🌐 Deploying Ingress..."
kubectl apply -f ingress.yaml

echo "✅ Deployment completed!"
echo ""
echo "📊 Check status:"
echo "kubectl get pods -n chatbot"
echo "kubectl get services -n chatbot"
echo "kubectl get ingress -n chatbot"
echo ""
echo "🔍 View logs:"
echo "kubectl logs -l app=chatbot-backend -n chatbot"
echo "kubectl logs -l app=redis -n chatbot"
echo ""
echo "🧪 Test the API:"
echo "kubectl port-forward svc/chatbot-backend 3000:3000 -n chatbot"
echo "curl http://localhost:3000/health"
