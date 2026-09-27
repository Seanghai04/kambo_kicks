# Shoes Store — one-time setup (PowerShell)

Write-Host "Starting PostgreSQL via Docker..."
docker compose up -d

Write-Host "Waiting for database..."
Start-Sleep -Seconds 5

Write-Host "Setting up backend..."
Set-Location backend
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
Set-Location ..

Write-Host "Setting up frontend..."
Set-Location frontend
npm install
Set-Location ..

Write-Host ""
Write-Host "Done! Start the apps with:"
Write-Host "  cd backend  && npm run dev"
Write-Host "  cd frontend && npm run dev"
