#!/bin/sh
set -e

echo "Waiting for database..."
until php -r "try { new PDO('pgsql:host=' . getenv('DB_HOST') . ';port=' . (getenv('DB_PORT') ?: '5432') . ';dbname=' . getenv('DB_DATABASE'), getenv('DB_USERNAME'), getenv('DB_PASSWORD')); exit(0); } catch (Exception $e) { exit(1); }" 2>/dev/null; do
  sleep 2
done

echo "Database is ready."
php artisan migrate --force
php artisan db:seed --force || echo "Seed skipped or already applied."

exec "$@"