docker compose stop postgres && 
docker compose rm -f postgres && 
docker volume rm loja-jm-decoracao-prod_postgres_data && 
docker compose up postgres -d