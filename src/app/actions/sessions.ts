"use server";

import { firestoreService } from "@/lib/firebase/service";
import { Session } from "@/types";
import { revalidatePath } from "next/cache";

export async function getSessions(userId: string) {
  return await firestoreService.getSessions(userId);
}

export async function saveSession(userId: string, session: Omit<Session, "id">) {
  const id = await firestoreService.saveSession(userId, session);
  revalidatePath("/");
  return id;
}

export async function updateSession(userId: string, sessionId: string, session: Partial<Session>) {
  await firestoreService.updateSession(userId, sessionId, session);
  revalidatePath("/");
}

export async function deleteSession(userId: string, sessionId: string) {
  await firestoreService.deleteSession(userId, sessionId);
  revalidatePath("/");
}
