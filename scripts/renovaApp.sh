#!/bin/bash

echo "=== INICIANDO LIMPEZA DESTRUTIVA PARCIAL (MINIO PROTEGIDO) ==="

# 1. Para e remove todos os containers, EXCETO o jm_storage_images
echo "Parando containers do projeto (menos MinIO)..."
docker ps -q | grep -v $(docker ps -aqf "name=jm_storage_images") | xargs -r docker stop 2>/dev/null || true
docker ps -aq | grep -v $(docker ps -aqf "name=jm_storage_images") | xargs -r docker rm 2>/dev/null || true

# 2. Remove todas as imagens, EXCETO a imagem do MinIO (minio/minio)
echo "Removendo imagens antigas (preservando minio/minio)..."
docker images -q | grep -v $(docker images -q minio/minio) | xargs -r docker rmi -f 2>/dev/null || true

# 3. Remove os volumes, EXCETO o volume que estiver atrelado ao jm_storage_images
# O comando abaixo filtra os volumes em uso pelo container do MinIO para não apagá-los
echo "Removendo volumes (preservando armazenamento do MinIO)..."
MINIO_VOLUMES=$(docker inspect jm_storage_images --format '{{range .Mounts}}{{if .Name}}{{.Name}}{{end}}{{end}}' 2>/dev/null)

if [ -n "$MINIO_VOLUMES" ]; then
    # Se encontrou volumes do MinIO, filtra eles da remoção geral
    docker volume ls -q | grep -v -E "($(echo $MINIO_VOLUMES | tr ' ' '|'))" | xargs -r docker volume rm 2>/dev/null || true
else
    # Se não mapeou volume nominal, roda a limpa nos outros
    docker volume ls -q | xargs -r docker volume rm 2>/dev/null || true
fi

# 4. Limpa o cache geral de build para forçar a leitura do código novo
docker builder prune -f

echo "=== RECONSTRUINDO A APLICAÇÃO ==="
# 5. Sobe o ambiente novamente. O Docker Compose vai reaproveitar o container do MinIO 
# que ficou intacto e vai reconstruir o Postgres (banco zerado), a API, o Vite e o Nginx.
docker compose up -d --build

echo "=== PROCESSO CONCLUÍDO ==="