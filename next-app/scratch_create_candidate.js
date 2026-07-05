require('dotenv').config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");
const bcrypt = require("bcryptjs");

const { Pool } = pg;
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = "candidate@hyriq.online";
  const password = "Password123";
  const passwordHash = bcrypt.hashSync(password, 10);
  
  // Expiry date (1 year from now)
  const expiry = new Date();
  expiry.setFullYear(expiry.getFullYear() + 1);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: {
        passwordHash,
        role: "candidate",
        name: "Test Candidate",
        onboardingCompleted: true,
        subscriptionExpiry: expiry
      },
      create: {
        email,
        passwordHash,
        role: "candidate",
        name: "Test Candidate",
        onboardingCompleted: true,
        subscriptionExpiry: expiry
      }
    });
    console.log("SUCCESS: Test candidate user upserted:", user.email);
  } catch (err) {
    console.error("ERROR: Failed to create candidate user:", err);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
