param(
    [Parameter(Mandatory = $true)]
    [string]$Password,

    [string]$Host = "localhost",
    [int]$Port = 5432,
    [string]$User = "postgres",
    [string]$Database = "shoes_store"
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"
$createdb = "C:\Program Files\PostgreSQL\18\bin\createdb.exe"

if (-not (Test-Path $psql)) {
    Write-Error "PostgreSQL not found at $psql. Install PostgreSQL or use Docker setup instead."
}

$env:PGPASSWORD = $Password

Write-Host "Testing connection to ${Host}:${Port}..."
& $psql -U $User -h $Host -p $Port -d postgres -w -c "SELECT version();" | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Error "Could not connect. Check your password and that PostgreSQL is running."
}

Write-Host "Creating database '$Database' if it does not exist..."
$dbExists = & $psql -U $User -h $Host -p $Port -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$Database'"
if ($dbExists -ne "1") {
    & $createdb -U $User -h $Host -p $Port $Database
    Write-Host "Database created."
} else {
    Write-Host "Database already exists."
}

$encodedPassword = [uri]::EscapeDataString($Password)
$databaseUrl = "postgresql://${User}:${encodedPassword}@${Host}:${Port}/${Database}?schema=public"

$envPath = Join-Path $PSScriptRoot "backend\.env"
(Get-Content $envPath) -replace 'DATABASE_URL=".*"', "DATABASE_URL=`"$databaseUrl`"" | Set-Content $envPath
Write-Host "Updated backend/.env"

Set-Location (Join-Path $PSScriptRoot "backend")
npm run db:generate
npm run db:migrate
npm run db:seed

Write-Host ""
Write-Host "Database setup complete!"
Write-Host "Start backend: cd backend && npm run dev"
