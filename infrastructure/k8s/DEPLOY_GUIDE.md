# Deploy com Kubernetes

Este guia cobre o deploy dos serviços Redis, Backend e Frontend usando Kubernetes, seguindo o padrão do `challenge.md`.

## Pré-requisitos
- Cluster Kubernetes configurado (local ou cloud)
- `kubectl` instalado e configurado
- Docker images publicadas ou build local

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

## 6. Ingress
Configure o acesso externo (URLs públicas):
```bash
kubectl apply -f infrastructure/k8s/ingress.yaml
```
- O arquivo define as rotas públicas para backend e frontend.
- Após aplicar, verifique o endereço público do ingress:
  ```bash
  kubectl get ingress -n chatbot
  ```

## 7. Verificação
- Verifique se todos os pods estão rodando:
  ```bash
  kubectl get pods -n chatbot
  ```
- Teste as URLs públicas do backend e frontend conforme configurado no ingress.

## 8. Variáveis de ambiente em produção
- Use secrets/configMap para passar variáveis do `.env` para os containers.
- Não copie o `.env` diretamente para o container em produção.
- Exemplo de uso no `backend.yaml`:
  ```yaml
  envFrom:
    - secretRef:
        name: chatbot-secrets
  ```

## 9. Backup/Restore do Redis
- O volume persistente do Redis garante os dados.
- Para restaurar, substitua o arquivo `dump.rdb` no volume antes de subir o pod.
- Para backup, copie o arquivo do volume para um storage seguro.

## 10. Referências
- [challenge.md](../../challenge.md)
- [docker-compose.yml](../../infrastructure/docker/docker-compose.yml)
- [k8s/](../../infrastructure/k8s/)

---

Se todos os passos estiverem completos, siga para o deploy prático dos serviços.
