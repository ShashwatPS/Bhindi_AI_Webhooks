"use server";

import { cookies } from "next/headers";

export default async function deleteUserTokenFromCookies() {
    const cookieStore = await cookies();

  const allCookies = {
    authToken: {
      value: null,
      options: { httpOnly: true, secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", path: "/", maxAge: 0 },
    },
  };

  Object.entries(allCookies).forEach(([name, { value, options }]) => {
    cookieStore.set(name, value, options);
  });    
}