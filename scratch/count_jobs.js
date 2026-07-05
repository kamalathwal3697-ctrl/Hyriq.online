import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const { Pool } = pg;
const connectionString = "postgres://7252cc1930e59dc12a154aac62ad203c2bcdf60aecc4b39a8c61942c09d7c951:sk_WkclxsvP55xLmBkBTJAUs@db.prisma.io:5432/postgres?sslmode=require";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.count();
  const jobs = await prisma.job.count();
  console.log(`DATABASE STATUS: Users=${users}, Jobs=${jobs}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
