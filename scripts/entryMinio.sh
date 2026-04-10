#!/bin/sh

# 1. Inicia o servidor MinIO em segundo plano (&)
# --console-address ":9001" permite que você acesse o painel visual
minio server /data --console-address ":9001" &

# 2. Guarda o ID do processo do servidor para não deixar o container fechar depois
minio_pid=$!

# 3. Aguarda o servidor estar 100% operacional antes de tentar configurar
# Em máquinas mais lentas, 5 segundos é o ideal
echo "Aguardando o MinIO iniciar..."
sleep 5;

# 4. Configura o 'mc' (MinIO Client) para gerenciar o servidor local
# O comando 'mc alias set' cria uma conexão chamada 'local'
mc alias set local http://localhost:9000 "${MINIO_ROOT_USER}" "${}";

# 5. Cria o bucket 'loja-jm' caso ele ainda não exista
# O '|| true' evita que o script pare se o bucket já existir de uma execução anterior
echo "Criando bucket 'loja-jm'..."
mc mb local/loja-jm || true;

# 6. Define a política de acesso como 'pública' para leitura
# Isso permite que o seu Frontend acesse as imagens via URL sem precisar de tokens
echo "Configurando política pública para o bucket..."
mc anonymous set download local/loja-jm;

echo "Infraestrutura de Storage pronta!"

# 7. Mantém o processo do MinIO rodando no primeiro plano
# Se esse script acabar, o container morre. O 'wait' impede isso.
wait $minio_pid