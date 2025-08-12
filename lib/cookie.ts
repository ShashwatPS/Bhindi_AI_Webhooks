"use server"

import { cookies } from "next/headers";


export async function setMyCookies(authToken: string, _id: string, userId: string, username: string) {
  const cookieStore = await cookies();

  const allCookies = {
    authToken: {
      value: authToken,
      options: { httpOnly: true, secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 },
    },
    _id: {
      value: _id,
      options: { httpOnly: true, secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 },
    },
    userId: {
      value: userId,
      options: { httpOnly: true, secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 },
    },
    username: {
      value: username,
      options: { httpOnly: true, secure: process.env.NEXT_PUBLIC_NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 },
    },
  };

  Object.entries(allCookies).forEach(([name, { value, options }]) => {
    cookieStore.set(name, value, options);
  });
}
