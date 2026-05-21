docker stop loja-jm-decoracao-dev-postgres-1 && 
docker rm loja-jm-decoracao-dev-postgres-1   &&
docker rmi $(docker images --filter=reference='*postgres*' -q)    &&
docker volume rm loja-jm-decoracao-dev_postgres_data
docker compose up postgres -d