import "server-only";

/** Vercel/Lambda filesystem is read-only — local JSON mirror must never fail the request there. */
export function isReadOnlyServerless(): boolean {
  return process.env.VERCEL === "1" || Boolean(process.env.AWS_LAMBDA_FUNCTION_NAME);
}
