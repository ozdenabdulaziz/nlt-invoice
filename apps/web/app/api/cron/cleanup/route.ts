import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";

export async function GET(request: Request) {
  // Authorization check for Vercel Cron
  // You should add CRON_SECRET to your environment variables
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const now = new Date();
    // 7 days ago
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // 1. Delete expired Estimates (expiryDate is strictly less than now)
    const deletedEstimates = await prisma.estimate.deleteMany({
      where: {
        expiryDate: {
          lt: now,
        },
      },
    });

    // 2. Delete draft Invoices older than 7 days (based on updatedAt)
    const deletedDrafts = await prisma.invoice.deleteMany({
      where: {
        status: "DRAFT",
        updatedAt: {
          lt: sevenDaysAgo,
        },
      },
    });

    console.log(`Cron cleanup completed. Deleted ${deletedEstimates.count} estimates and ${deletedDrafts.count} drafts.`);

    return NextResponse.json({
      success: true,
      message: "Cleanup complete",
      deletedEstimates: deletedEstimates.count,
      deletedDrafts: deletedDrafts.count,
    });
  } catch (error) {
    console.error("Cron cleanup error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
