#! /bin/bash

docker start app-builder-db || docker run -d \
  --name app-builder-db \
  -e POSTGRES_PASSWORD='app-builder' \
  -e POSTGRES_USER='app-builder' \
  -e POSTGRES_DB='app-builder' \
  -p 127.0.0.1:5432:5432 \
  postgres:12.2