import { headers } from "next/headers";
import { auth } from "@/lib/auth";

export class AuthError extends Error {
  statusCode: number;
  code: string;

  constructor(message: string, statusCode = 401, code = "UNAUTHENTICATED") {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
    this.code = code;
  }
}

export async function requireSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });

  if (!session || !session.user) {
    throw new AuthError("Active authenticated session is required", 401, "UNAUTHENTICATED");
  }

  return session;
}
