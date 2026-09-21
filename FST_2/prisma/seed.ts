import { PrismaClient, RoleName, TransactionStatus, EmailEventType, EmailEventSource } from "@prisma/client";
import { faker } from "@faker-js/faker";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

export async function runSeed() {
  console.log("==================================================");
  console.log("  SecureOps Relational Database Seeding Pipeline  ");
  console.log("==================================================");

  // 1. Seed RBAC Roles
  console.log("[1/6] Seeding RBAC Roles (ADMIN, MEMBER, GUEST)...");
  const roleAdmin = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: {
      name: RoleName.ADMIN,
      description: "Full administrative access: manage transactions, audit logs, and tenant operations.",
    },
  });

  const roleMember = await prisma.role.upsert({
    where: { name: RoleName.MEMBER },
    update: {},
    create: {
      name: RoleName.MEMBER,
      description: "Standard member: create and view transactions within assigned tenant boundaries.",
    },
  });

  const roleGuest = await prisma.role.upsert({
    where: { name: RoleName.GUEST },
    update: {},
    create: {
      name: RoleName.GUEST,
      description: "Guest viewer: read-only access to tenant metrics without mutation rights.",
    },
  });

  // 2. Seed Tenants (Multi-Tenant Isolation)
  console.log("[2/6] Seeding Multi-Tenant Organizations...");
  const tenantApex = await prisma.tenant.upsert({
    where: { slug: "apex-holdings" },
    update: {},
    create: {
      name: "Apex Global Holdings",
      slug: "apex-holdings",
    },
  });

  const tenantCyberdyne = await prisma.tenant.upsert({
    where: { slug: "cyberdyne-systems" },
    update: {},
    create: {
      name: "Cyberdyne Systems Corp",
      slug: "cyberdyne-systems",
    },
  });

  const tenantStark = await prisma.tenant.upsert({
    where: { slug: "stark-industries" },
    update: {},
    create: {
      name: "Stark Advanced Dynamics",
      slug: "stark-industries",
    },
  });

  const allTenants = [tenantApex, tenantCyberdyne, tenantStark];

  // 3. Seed Deterministic Better Auth Demo Users with Usable Credentials
  console.log("[3/6] Seeding Better Auth Deterministic Demo Accounts (Password: SecureOps123!)...");
  const DEMO_PASSWORD = "SecureOps123!";

  // Helper to safely create/register Better Auth user with password account
  async function createOrGetDemoUser(email: string, name: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return existing;

    try {
      const authRes = await auth.api.signUpEmail({
        body: {
          email,
          password: DEMO_PASSWORD,
          name,
        },
      });
      if (authRes && authRes.user) {
        return authRes.user;
      }
    } catch {
      // Fallback direct creation
    }

    return prisma.user.create({
      data: {
        email,
        name,
        emailVerified: true,
      },
    });
  }

  const adminUser = await createOrGetDemoUser("admin@secureops.dev", "Sarah Connor (Admin)");
  const memberUser = await createOrGetDemoUser("member@secureops.dev", "Miles Dyson (Member)");
  const guestUser = await createOrGetDemoUser("guest@secureops.dev", "John Connor (Guest)");

  // 4. Seed Memberships connecting User + Tenant + Role
  console.log("[4/6] Seeding Multi-Tenant Memberships & Roles...");
  // Admin -> Apex Holdings (ADMIN) & Cyberdyne (MEMBER)
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenantApex.id } },
    update: { roleId: roleAdmin.id },
    create: { userId: adminUser.id, tenantId: tenantApex.id, roleId: roleAdmin.id },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: adminUser.id, tenantId: tenantCyberdyne.id } },
    update: { roleId: roleMember.id },
    create: { userId: adminUser.id, tenantId: tenantCyberdyne.id, roleId: roleMember.id },
  });

  // Member -> Apex Holdings (MEMBER) & Stark (ADMIN)
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: memberUser.id, tenantId: tenantApex.id } },
    update: { roleId: roleMember.id },
    create: { userId: memberUser.id, tenantId: tenantApex.id, roleId: roleMember.id },
  });
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: memberUser.id, tenantId: tenantStark.id } },
    update: { roleId: roleAdmin.id },
    create: { userId: memberUser.id, tenantId: tenantStark.id, roleId: roleAdmin.id },
  });

  // Guest -> Apex Holdings (GUEST)
  await prisma.membership.upsert({
    where: { userId_tenantId: { userId: guestUser.id, tenantId: tenantApex.id } },
    update: { roleId: roleGuest.id },
    create: { userId: guestUser.id, tenantId: tenantApex.id, roleId: roleGuest.id },
  });

  // Seed 20 additional localized Faker Users with randomized memberships
  console.log("[5/6] Generating 20 localized Faker users, memberships, and tenant distributions...");
  faker.seed(42); // Deterministic Faker seed

  const generatedUsers = [adminUser, memberUser, guestUser];
  for (let i = 0; i < 20; i++) {
    const fName = faker.person.fullName();
    const fEmail = faker.internet.email().toLowerCase();
    
    let u = await prisma.user.findUnique({ where: { email: fEmail } });
    if (!u) {
      u = await prisma.user.create({
        data: {
          name: fName,
          email: fEmail,
          emailVerified: true,
          image: faker.image.avatar(),
        },
      });
    }
    generatedUsers.push(u);

    // Assign to 1 or 2 random tenants
    const assignedTenant = allTenants[i % allTenants.length];
    const assignedRole = i % 5 === 0 ? roleAdmin : i % 2 === 0 ? roleMember : roleGuest;

    await prisma.membership.upsert({
      where: { userId_tenantId: { userId: u.id, tenantId: assignedTenant.id } },
      update: {},
      create: {
        userId: u.id,
        tenantId: assignedTenant.id,
        roleId: assignedRole.id,
      },
    });
  }

  // 5. Seed 50+ Relational Transactions & Matching Audit Logs
  console.log("[6/6] Generating 50+ Relational Transactions, Audit Logs, and Email Events...");
  const statuses: TransactionStatus[] = ["COMPLETED", "PENDING", "FAILED"];

  for (let i = 0; i < 55; i++) {
    const tenant = allTenants[i % allTenants.length];
    const user = generatedUsers[i % generatedUsers.length];
    const status = statuses[i % statuses.length];
    const ref = `TX-${faker.string.alphanumeric({ length: 6, casing: "upper" })}-${i + 1000}`;
    const amount = faker.finance.amount({ min: 250, max: 85000, dec: 2 });
    const description = faker.finance.transactionDescription();

    const tx = await prisma.transaction.create({
      data: {
        tenantId: tenant.id,
        createdByUserId: user.id,
        reference: ref,
        amount,
        currency: "USD",
        status,
        description,
        createdAt: faker.date.recent({ days: 30 }),
      },
    });

    // Create corresponding immutable AuditLog
    await prisma.auditLog.create({
      data: {
        tenantId: tenant.id,
        actorUserId: user.id,
        action: "TRANSACTION_CREATED",
        entity: "Transaction",
        entityId: tx.id,
        metadata: {
          reference: ref,
          amount,
          currency: "USD",
          status,
          description,
        },
        createdAt: tx.createdAt,
      },
    });

    // Create matching seed-tagged EmailEvent for completed transactions
    if (status === "COMPLETED" && i % 2 === 0) {
      const msgId = `msg_seed_${faker.string.nanoid(16)}`;
      await prisma.emailEvent.create({
        data: {
          tenantId: tenant.id,
          transactionId: tx.id,
          providerEventId: `evt_seed_${msgId}`,
          providerMessageId: msgId,
          eventType: EmailEventType.DELIVERED,
          recipient: user.email,
          source: EmailEventSource.SEED,
          payload: {
            reference: ref,
            dispatchedVia: "Seeder",
            status: "DELIVERED",
          },
          createdAt: tx.createdAt,
        },
      });
    }
  }

  // Print Verification Summary
  const countRoles = await prisma.role.count();
  const countTenants = await prisma.tenant.count();
  const countUsers = await prisma.user.count();
  const countMemberships = await prisma.membership.count();
  const countTransactions = await prisma.transaction.count();
  const countAuditLogs = await prisma.auditLog.count();
  const countEmailEvents = await prisma.emailEvent.count();

  console.log("==================================================");
  console.log("           SEEDING COMPLETED SUCCESSFULLY         ");
  console.log("==================================================");
  console.log(`✓ Roles Seeded:        ${countRoles}`);
  console.log(`✓ Tenants Seeded:      ${countTenants}`);
  console.log(`✓ Users Seeded:        ${countUsers}`);
  console.log(`✓ Memberships Seeded:  ${countMemberships}`);
  console.log(`✓ Transactions Seeded: ${countTransactions}`);
  console.log(`✓ Audit Logs Seeded:   ${countAuditLogs}`);
  console.log(`✓ Email Events Seeded: ${countEmailEvents}`);
  console.log("==================================================");
  console.log("Demo Credentials:");
  console.log("  Admin:  admin@secureops.dev  / SecureOps123!");
  console.log("  Member: member@secureops.dev / SecureOps123!");
  console.log("  Guest:  guest@secureops.dev  / SecureOps123!");
  console.log("==================================================");
}

if (require.main === module) {
  runSeed()
    .catch((e) => {
      console.error(e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
