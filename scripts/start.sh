#!/usr/bin/env bash

# Check if npm is installed
if ! [ -x "$(command -v npm)" ]; then
  echo 'Error: npm is not installed. Please install to continue' >&2
  exit 1
fi

# Check if docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Docker is not running. Please start Docker and try again."
    exit 1
fi

if [ -z "$USE_REMOTE_DB" ]; then
    echo "USE_REMOTE_DB is not set. Spinning Up Local Databases."

  # Check if database image is running
  if ! docker ps | grep -q "update-portal_db"; then
      echo "Database image is not running. Starting..."

      # Start the database image
      docker run --name update-portal_db -p 3306:3306 -e MYSQL_ROOT_PASSWORD=update-portal -e MYSQL_DATABASE=updateportal -e MYSQL_USER=update-portal -e MYSQL_PASSWORD=update-portal -d mariadb:10.3

      # Wait for the database to start
      while ! docker logs update-portal_db 2>&1 | grep -q "mysqld: ready for connections"; do
          echo "Waiting for database to start..."
          sleep 5
      done

      # Wait an extra 10 seconds for the database to be ready
      echo "Waiting for database to start..."
      sleep 10

      # Grant access to all databases
      docker exec -it update-portal_db mysql -u root -pupdate-portal -e "GRANT ALL PRIVILEGES ON *.* TO 'update-portal'@'%' IDENTIFIED BY 'update-portal';"
  fi

  # Check if database is initialized
  if ! docker exec update-portal_db mysql -u update-portal -pupdate-portal updateportal -e "SELECT * FROM migrations ORDER BY id DESC LIMIT 1;" | grep -q "2023-01-20-000000"; then
      echo "updateportal database is not initialized. Initializing..."

      # Initialize the database from string
      docker exec update-portal_db mysql -u update-portal -pupdate-portal updateportal -e "$(cat ./scripts/dev_portal.sql)"
  fi

  # Check if mybb database is initialized
  if ! docker exec update-portal_db mysql -u update-portal -pupdate-portal mybb -e "SELECT * FROM mybb_users ORDER BY uid ASC LIMIT 1;" | grep -q "test@localhost.com"; then
      echo "myBB database is not initialized. Initializing..."
      echo "This may take a few minutes..."

      # check if mybb.sql file exists
      if [ ! -f ./scripts/mybb.sql ]; then
          echo "mybb.sql file not found. Please download from dev server and place in the scripts folder."
          echo "mysqldump -h localhost -u \$USERNAME -p\$PASSWORD admin_mybb > ./scripts/mybb.sql"
          exit 1
      fi

      # Initialize the database from string
      echo "Copying mybb.sql to container..."
      docker cp ./scripts/mybb.sql update-portal_db:/mybb.sql
      echo "copied! Executing sql..."
      docker exec update-portal_db mysql -u update-portal -pupdate-portal -e "CREATE DATABASE mybb;"
      docker exec update-portal_db sh -c 'mysql -u update-portal -pupdate-portal mybb < /mybb.sql'
      echo "done!"
  fi

  # check if simdata database is initialized
  if ! docker exec update-portal_db mysql -u update-portal -pupdate-portal simdata -e "SELECT * FROM bojo_translation ORDER BY BojoID ASC LIMIT 1;" | grep -q "Name Redacted"; then
      echo "simdata database is not initialized. Initializing..."

      # check if simdata.sql file exists
      if [ ! -f ./scripts/simdata.sql ]; then
          echo "simdata.sql file not found. Please download from dev server and place in the scripts folder."
          echo "you will not be able to view teams"
          echo "mysqldump -h localhost -u \$USERNAME -p\$PASSWORD admin_simdata > ./scripts/simdata.sql"
      else
          echo "Copying simdata.sql to container..."
          docker cp ./scripts/simdata.sql update-portal_db:/simdata.sql
          echo "copied! Executing sql..."
          docker exec update-portal_db mysql -u update-portal -pupdate-portal -e "CREATE DATABASE simdata;"
          docker exec update-portal_db sh -c 'mysql -u update-portal -pupdate-portal simdata < /simdata.sql'
          echo "done!"
      fi
  fi
  export MYSQL_HOST="localhost"
  export MYSQL_USER="update-portal"
  export MYSQL_PASSWORD="update-portal"
  export MYSQL_UPDATE_DATABASE="updateportal"
  export MYSQL_BB_DATABASE="mybb"
  export MYSQL_SIM_DATABASE="simdata"
  export SECRET="local-secret"
  export NEXT_PUBLIC_API_ENDPOINT="http://localhost:3000"
else
  echo "USE_REMOTE_TB is set. Using Remote Databases."

  # Check if MYSQL_PASSWORD is set
  if [ -z "$MYSQL_PASSWORD" ]; then
      echo "MYSQL_PASSWORD is not set. Please set to continue."
      exit 1
  fi

  export MYSQL_HOST="localhost"
  export MYSQL_USER="admin_dev"
  export MYSQL_UPDATE_DATABASE="dev_portal"
  export MYSQL_BB_DATABASE="admin_mybb"
  export MYSQL_SIM_DATABASE="dev_simdata"
  export SECRET="local-secret"
  export NEXT_PUBLIC_API_ENDPOINT="http://localhost:3000"
fi

yarn install
yarn dev
