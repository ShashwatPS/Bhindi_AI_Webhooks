"use server";

import { cookies } from "next/headers";

export default async function getUserTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const authToken = cookieStore.get("authToken")?.value ?? null;
  return authToken;
}