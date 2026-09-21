import { execSync } from "child_process";
import { runSeed } from "../prisma/seed";
import prisma from "../lib/prisma";

async function main() {
  console.log("==================================================");
  console.log("    SecureOps DB Reset & Seeding Automation CLI   ");
  console.log("==================================================");

  try {
    console.log("[1/4] Pushing Prisma Schema to PostgreSQL Database...");
    execSync("npx prisma db push --accept-data-loss", {
      stdio: "inherit",
      env: process.env,
    });

    console.log("[2/4] Generating Prisma Client Types...");
    execSync("npx prisma generate", {
      stdio: "inherit",
      env: process.env,
    });

    console.log("[3/4] Purging existing database tables...");
    // Clear in proper foreign-key cascade order
    await prisma.emailEvent.deleteMany();
    await prisma.auditLog.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.membership.deleteMany();
    await prisma.session.deleteMany();
    await prisma.account.deleteMany();
    await prisma.user.deleteMany();
    await prisma.tenant.deleteMany();
    await prisma.role.deleteMany();

    console.log("[4/4] Executing Relational Faker Seeder...");
    await runSeed();

    console.log(">>> Database reset and automated seeding pipeline finished perfectly!");
  } catch (error) {
    console.error("Pipeline failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
