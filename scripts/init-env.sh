#!/bin/sh
set -e

echo "🔐 Gerando credenciais criptográficas seguras..."

# Usa os recursos nativos do próprio terminal (sem depender de docker ou openssl externo)
DB_PASS=$(head -c 18 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9')
JWT_SEC=$(head -c 36 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9')
JWT_ADM=$(head -c 36 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9')
MIN_PASS=$(head -c 18 /dev/urandom | base64 | tr -dc 'a-zA-Z0-9')

# Cria estritamente o arquivo .env local
cat <<EOF > .env
# --- CONFIGURAÇÕES DO BANCO DE DADOS ---
DB_HOST=postgres
DB_PORT=5432
DB_USER=jm
DB_NAME=jm_decoracao
DB_PASSWORD=${DB_PASS}

# --- AUTENTICAÇÃO E SEGURANÇA ---
JWT_SECRET=${JWT_SEC}
JWT_SECRET_ADMIN=${JWT_ADM}

# --- CONFIGURAÇÕES DO SERVIDOR ---
PORT=3000

# --- ARMAZENAMENTO (MINIO) ---
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_BUCKET=loja-jm
MINIO_REGION=us-east-1
MINIO_ROOT_USER=admin
MINIO_ROOT_PASSWORD=${MIN_PASS}
EOF

echo "✅ Arquivo .env gerado com sucesso."