import prisma from "../lib/prisma";

async function check() {
  try {
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        memberships: {
          include: {
            tenant: true,
            role: true,
          },
        },
      },
    });
    console.log("Found users count:", users.length);
    for (const u of users) {
      console.log(`User: ${u.email} | Accounts: ${u.accounts.length} | Memberships: ${u.memberships.length}`);
    }
  } catch (err: unknown) {
    console.error("Database check error:", err instanceof Error ? err.message : err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
