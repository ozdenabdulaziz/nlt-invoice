import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "OZDENMIKE1@GMAIL.COM".toLowerCase();
  
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      ownedCompany: {
        include: {
          subscription: true,
        },
      },
    },
  });

  if (!user) {
    console.log(`User with email ${email} not found.`);
    return;
  }

  if (!user.ownedCompany) {
    console.log(`User ${email} does not own a company.`);
    return;
  }

  const companyId = user.ownedCompany.id;
  const currentSubscription = user.ownedCompany.subscription;

  if (currentSubscription) {
    const updated = await prisma.subscription.update({
      where: { companyId },
      data: {
        plan: "PRO",
        status: "ACTIVE",
      },
    });
    console.log(`Updated subscription for company ${companyId} to PRO.`);
    console.log(updated);
  } else {
    const created = await prisma.subscription.create({
      data: {
        companyId,
        plan: "PRO",
        status: "ACTIVE",
      },
    });
    console.log(`Created new PRO subscription for company ${companyId}.`);
    console.log(created);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
