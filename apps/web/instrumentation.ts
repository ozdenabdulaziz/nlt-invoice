export async function register() {
  // Validate environment variables on server startup.
  // This runs once when the Next.js server (or serverless function) initialises.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { validateEnv } = await import("@/lib/env");
    validateEnv();
  }
}
