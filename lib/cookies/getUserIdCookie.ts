"use server";

import { cookies } from "next/headers";

export default async function getUserIdFromCookies(): Promise<string | null> {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value ?? null;
  return userId;
}