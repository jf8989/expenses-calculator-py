"use server";

import { firestoreService } from "@/lib/firebase/service";
import { revalidatePath } from "next/cache";

export async function getParticipants(userId: string) {
  return await firestoreService.getParticipants(userId);
}

export async function addParticipant(userId: string, name: string) {
  await firestoreService.addParticipant(userId, name);
  revalidatePath("/");
}

export async function removeParticipant(userId: string, name: string) {
  await firestoreService.removeParticipant(userId, name);
  revalidatePath("/");
}

export async function getUserData(userId: string) {
  return await firestoreService.getUserData(userId);
}
