# Docker PostgreSQL Setup for Local Development

When you're ready to set up a local PostgreSQL database with Docker, follow these steps:

## 1. Install Docker
- Download Docker Desktop from: https://www.docker.com/products/docker-desktop/
- Install and start Docker Desktop

## 2. Create Docker PostgreSQL Container

**PowerShell (recommended for Windows):**
```powershell
# Create and start PostgreSQL container
docker run --name paste-recipe-postgres `
  -e POSTGRES_PASSWORD=password `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=paste_recipe_dev `
  -p 5432:5432 `
  -d postgres:15

# Verify it's running
docker ps
```

**Or as a single line (for other terminals):**
```powershell
docker run --name paste-recipe-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_USER=postgres -e POSTGRES_DB=paste_recipe_dev -p 5432:5432 -d postgres:15

# Verify it's running
docker ps
```

## 3. Update Local Environment
Update your `.env` file:
```env
# Local Docker PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/paste_recipe_dev"
```

## 4. Run Database Migration
```bash
# Push schema to your local database
npx prisma db push

# (Optional) View your local database
npx prisma studio
```

## 5. Docker Commands (Future Reference)
```bash
# Start the container (if stopped)
docker start paste-recipe-postgres

# Stop the container
docker stop paste-recipe-postgres

# Remove the container (deletes all data)
docker rm paste-recipe-postgres

# View logs
docker logs paste-recipe-postgres
```

## Benefits of Docker Setup
- ✅ Isolated local development database
- ✅ Easy to reset/recreate
- ✅ Same PostgreSQL version as production
- ✅ No data conflicts with production
- ✅ Can test database migrations safely