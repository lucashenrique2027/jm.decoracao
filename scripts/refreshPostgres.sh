docker stop loja-jm-decoracao-prod-postgres-1 && 
docker rm loja-jm-decoracao-prod-postgres-1   &&
docker rmi $(docker images --filter=reference='*postgres*' -q)    &&
docker volume rm loja-jm-decoracao-prod_postgres_data
docker compose up postgres -d