import { PrismaClient, Plan, MembershipRole, SubscriptionStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("Test123!", 10);

  console.log("Cleaning up existing test accounts...");
  await prisma.user.deleteMany({ 
    where: { 
      email: { in: ["free@test.com", "pro@test.com"] } 
    } 
  });

  console.log("Creating FREE test user...");
  const freeUser = await prisma.user.create({
    data: {
      name: "Free Tester",
      email: "free@test.com",
      emailVerified: new Date(),
      passwordHash,
      ownedCompany: {
        create: {
          companyName: "Free Tester Inc",
          legalName: "Free Tester Ltd",
          country: "Canada",
          onboardingCompleted: true,
          subscription: {
            create: {
              plan: Plan.FREE,
              status: SubscriptionStatus.INACTIVE
            }
          }
        }
      }
    },
    include: {
      ownedCompany: true
    }
  });

  if (freeUser.ownedCompany) {
    await prisma.membership.create({
      data: {
        userId: freeUser.id,
        companyId: freeUser.ownedCompany.id,
        role: MembershipRole.OWNER,
      }
    });
  }

  console.log("Creating PRO test user...");
  const proUser = await prisma.user.create({
    data: {
      name: "Pro Tester",
      email: "pro@test.com",
      emailVerified: new Date(),
      passwordHash,
      ownedCompany: {
        create: {
          companyName: "Pro Tester Inc",
          legalName: "Pro Tester Ltd",
          country: "Canada",
          onboardingCompleted: true,
          subscription: {
            create: {
              plan: Plan.PRO,
              status: SubscriptionStatus.ACTIVE,
              stripeCustomerId: "cus_mock_pro_tester_" + Date.now(),
              stripeSubscriptionId: "sub_mock_pro_tester_" + Date.now(),
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            }
          }
        }
      }
    },
    include: {
      ownedCompany: true
    }
  });

  if (proUser.ownedCompany) {
    await prisma.membership.create({
      data: {
        userId: proUser.id,
        companyId: proUser.ownedCompany.id,
        role: MembershipRole.OWNER,
      }
    });
  }

  console.log("\n✅ Test Users Seeded Successfully!");
  console.log("-----------------------------------------");
  console.log(" FREE TIER ACCOUNT");
  console.log(" Email: free@test.com");
  console.log(" Password: Test123!");
  console.log(" Plan: FREE | Stripe Customer: NULL");
  console.log("-----------------------------------------");
  console.log(" PRO TIER ACCOUNT");
  console.log(" Email: pro@test.com");
  console.log(" Password: Test123!");
  console.log(" Plan: PRO | Subscription: ACTIVE");
  console.log("-----------------------------------------");
}

main()
  .catch(e => {
    console.error("Error seeding users:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
