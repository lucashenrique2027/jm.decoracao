#!/bin/sh
minio server /data --console-address ":9001" &
minio_pid=$!

echo "Aguardando o MinIO iniciar..."
sleep 5;

mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${}";

BUCKET_NAME="loja-jm"

echo "Criando bucket '${BUCKET_NAME}'..."
mc mb local/${BUCKET_NAME} --ignore-existing;

echo "Configurando política pública para o bucket..."
mc anonymous set download local/${BUCKET_NAME};

echo "Infraestrutura de Storage pronta!"

wait $minio_pid