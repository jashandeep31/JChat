"use server";

import { auth } from "@/lib/auth";
import { db, redis } from "@/lib/db";
import { User } from "@repo/db";
import { redirect } from "next/navigation";

export const getUser = async (): Promise<User | null> => {
  const session = await auth();
  if (!session?.user) redirect("/login");
  const key = `user:${session.user.id}`;
  const hit = await redis.get(key);
  if (hit) return JSON.parse(hit);
  const user = await db.user.findUnique({
    where: {
      id: session.user.id,
    },
  });
  await redis.set(key, JSON.stringify(user), "EX", 60 * 20);
  return user;
};
