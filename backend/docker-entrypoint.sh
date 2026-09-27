#!/bin/sh
set -e

PORT="${PORT:-5000}"

echo "Waiting for database..."
until php -r "
  \$dsn = getenv('DB_URL');
  if (\$dsn) {
    \$url = parse_url(\$dsn);
    \$host = \$url['host'] ?? '127.0.0.1';
    \$port = \$url['port'] ?? 5432;
    \$db = ltrim(\$url['path'] ?? '/neondb', '/');
    \$user = \$url['user'] ?? '';
    \$pass = \$url['pass'] ?? '';
  } else {
    \$host = getenv('DB_HOST') ?: '127.0.0.1';
    \$port = getenv('DB_PORT') ?: '5432';
    \$db = getenv('DB_DATABASE') ?: 'neondb';
    \$user = getenv('DB_USERNAME') ?: '';
    \$pass = getenv('DB_PASSWORD') ?: '';
  }
  try {
    new PDO('pgsql:host='.\$host.';port='.\$port.';dbname='.\$db.';sslmode=require', \$user, \$pass);
    exit(0);
  } catch (Throwable \$e) {
    exit(1);
  }
" 2>/dev/null; do
  sleep 2
done

echo "Database is ready."
php artisan migrate --force

# Only seed when explicitly enabled (avoids wiping production data on every restart)
if [ "${SEED_ON_START:-false}" = "true" ]; then
  echo "SEED_ON_START=true → seeding database..."
  php artisan db:seed --force || echo "Seed skipped or already applied."
fi

# Prefer Railway PORT if CMD still hardcodes 5000
if [ "$#" -gt 0 ]; then
  case "$*" in
    *"--port=5000"*|*"artisan serve"*)
      exec php artisan serve --host=0.0.0.0 --port="$PORT"
      ;;
    *)
      exec "$@"
      ;;
  esac
fi

exec php artisan serve --host=0.0.0.0 --port="$PORT"
