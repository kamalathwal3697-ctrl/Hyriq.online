$env:DATABASE_URL="postgres://7252cc1930e59dc12a154aac62ad203c2bcdf60aecc4b39a8c61942c09d7c951:sk_WkclxsvP55xLmBkBTJAUs@db.prisma.io:5432/postgres?sslmode=require"
Write-Host "Running prisma db push..."
npx prisma db push --schema=next-app/prisma/schema.prisma
Write-Host "Running data migration..."
node migrate_data.js
