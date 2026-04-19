import { verifyEmailAction } from "@/server/actions/auth";

export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const token =
    typeof searchParams?.token === "string"
      ? searchParams.token
      : undefined;

  if (!token) {
    return <div>Invalid or missing verification token</div>;
  }

  let result: { success: boolean; message?: string } | null = null;

  try {
    result = await verifyEmailAction(token);
  } catch (error) {
    console.error("VERIFY EMAIL ERROR:", error);
    return <div>Something went wrong during verification</div>;
  }

  if (!result || !result.success) {
    return <div>Verification failed or token expired</div>;
  }

  return <div>Email verified successfully</div>;
}

