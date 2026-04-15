"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@convex/_generated/api";
import type { Id } from "@convex/_generated/dataModel";

const ADMIN_COOKIE = "admin_auth";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Choquer91!";

function requireAuth(jar: Awaited<ReturnType<typeof cookies>>) {
  if (jar.get(ADMIN_COOKIE)?.value !== "ok") {
    throw new Error("Unauthorized");
  }
}

function getConvex() {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("NEXT_PUBLIC_CONVEX_URL is not set");
  return new ConvexHttpClient(url);
}

export async function login(formData: FormData) {
  const password = formData.get("password");
  if (typeof password !== "string" || password !== ADMIN_PASSWORD) {
    redirect("/admin?error=1");
  }
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, "ok", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect("/admin");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
  redirect("/admin");
}

export async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get(ADMIN_COOKIE)?.value === "ok";
}

export async function approveSubmission(id: string) {
  const jar = await cookies();
  requireAuth(jar);
  const convex = getConvex();
  await convex.mutation(api.jobSubmissions.approveSubmission, {
    id: id as Id<"jobSubmissions">,
  });
  revalidatePath("/admin");
  revalidatePath("/jobs");
  revalidatePath("/");
}

export async function rejectSubmission(id: string) {
  const jar = await cookies();
  requireAuth(jar);
  const convex = getConvex();
  await convex.mutation(api.jobSubmissions.rejectSubmission, {
    id: id as Id<"jobSubmissions">,
  });
  revalidatePath("/admin");
}

export async function deleteSubmission(id: string) {
  const jar = await cookies();
  requireAuth(jar);
  const convex = getConvex();
  await convex.mutation(api.jobSubmissions.deleteSubmission, {
    id: id as Id<"jobSubmissions">,
  });
  revalidatePath("/admin");
}
