# Redis Backup via Docker

Este guia mostra como realizar o backup dos dados do Redis rodando em Docker e restaurar automaticamente ao subir o container.

## Analisar quantidades de chaves

```bash
docker-compose exec redis redis-cli KEYS "cache:embedding:*" | wc -l
docker-compose exec redis redis-cli KEYS "cache:processed_articles:quick" | wc -l
docker-compose exec redis redis-cli KEYS "cache:context:*" | wc -l
docker-compose exec redis redis-cli KEYS "chat:history:*" | wc -l
```

## Backup do Redis

1. **Acesse o diretório do docker-compose:**
   ```bash
   cd infrastructure/docker
   ```
2. **Force o Redis a salvar o dump:**
   ```bash
   docker-compose exec redis redis-cli SAVE
   ```
3. **Copie o arquivo dump.rdb do container para o host:**
   ```bash
   docker cp $(docker-compose ps -q redis):/data/dump.rdb ./redis_data/backup_$(date +%Y%m%d_%H%M%S).rdb
   ```
   O arquivo de backup ficará em `infrastructure/docker/redis_data/`.

## Restauração automática

Quando o container Redis for iniciado novamente, ele irá restaurar os dados do arquivo `dump.rdb` presente em `infrastructure/docker/redis_data/`, pois esse diretório está mapeado como volume no `docker-compose.yml`.

## Referência

- [Documentação oficial Redis persistence](https://redis.io/docs/management/persistence/)
- [docker-compose.yml](../../infrastructure/docker/docker-compose.yml)

---

> Para scripts e utilitários relacionados, veja também o diretório `/backend/scripts`.
