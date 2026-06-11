export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    try {
      const { validateProductionEnv } = await import("@/lib/validate-env");
      validateProductionEnv();
    } catch (error) {
      console.error(
        "Production env validation warning:",
        error instanceof Error ? error.message : error,
      );
    }
  }
}
