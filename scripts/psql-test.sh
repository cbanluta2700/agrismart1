#!/bin/bash

echo "Testing direct connection to Neon PostgreSQL using PSQL..."
echo

CONNECTION_STRING="postgres://neondb_owner:npg_OfArl0epnYW2@ep-gentle-band-a1nyci63-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require"

echo "Connection string: $CONNECTION_STRING"
echo
echo "Running test query:"
echo

psql "$CONNECTION_STRING" -c "SELECT current_database() as database, current_user as user, version() as version;"

if [ $? -eq 0 ]; then
  echo "Connection successful!"
else
  echo "Connection failed with error code: $?"
  echo
  echo "Possible issues:"
  echo "- Check if psql command is available (try running 'psql --version')"
  echo "- Check if the Neon PostgreSQL server is accessible from your network"
  echo "- Verify the connection string details are correct"
  echo "- Ensure your IP is allowed in Neon's connection settings"
fi
