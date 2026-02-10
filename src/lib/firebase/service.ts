import admin from "@/lib/firebase/admin";
import { Session, Transaction, UserData } from "@/types";

const db = admin.firestore();

/**
 * Maps legacy Firestore transaction data (which uses `assigned_to`) to the
 * app's Transaction interface (which uses `payer` and `splitWith`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeTransaction = (raw: any): Transaction => {
  // Use new field name `assigned_to` if present, otherwise fall back to `splitWith`
  const assigned_to = raw.assigned_to || raw.splitWith || [];

  return {
    description: raw.description || "",
    amount: Number(raw.amount) || 0,
    payer: raw.payer || undefined,
    assigned_to: assigned_to,
    date: raw.date || "",
    currency: raw.currency || undefined,
  };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const serializeTimestamps = (data: any): any => {
  if (!data || typeof data !== "object") return data;

  const serialized = { ...data };
  for (const key in serialized) {
    const value = serialized[key];
    if (value && typeof value === "object") {
      if (
        value.constructor?.name === "Timestamp" ||
        (value._seconds !== undefined && value._nanoseconds !== undefined)
      ) {
        serialized[key] = {
          seconds: value.seconds ?? value._seconds,
          nanoseconds: value.nanoseconds ?? value._nanoseconds,
        };
      } else if (Array.isArray(value)) {
        serialized[key] = value.map(serializeTimestamps);
      } else {
        serialized[key] = serializeTimestamps(value);
      }
    }
  }
  return serialized;
};

export const firestoreService = {
  async getUserData(userId: string): Promise<UserData | null> {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return null;
    return serializeTimestamps(userDoc.data()) as UserData;
  },

  async updateLastUpdated(userId: string) {
    await db
      .collection("users")
      .doc(userId)
      .set(
        {
          metadata: {
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          },
        },
        { merge: true },
      );
  },

  async getParticipants(userId: string): Promise<string[]> {
    const userDoc = await db.collection("users").doc(userId).get();
    if (!userDoc.exists) return [];
    const data = userDoc.data() as { participants?: string[] } | undefined;
    return (data?.participants || []).sort();
  },

  async addParticipant(userId: string, name: string) {
    await db
      .collection("users")
      .doc(userId)
      .update({
        participants: admin.firestore.FieldValue.arrayUnion(name),
      });
    await this.updateLastUpdated(userId);
  },

  async removeParticipant(userId: string, name: string) {
    await db
      .collection("users")
      .doc(userId)
      .update({
        participants: admin.firestore.FieldValue.arrayRemove(name),
      });
    await this.updateLastUpdated(userId);
  },

  async getSessions(userId: string): Promise<Session[]> {
    const sessionsSnapshot = await db
      .collection("users")
      .doc(userId)
      .collection("sessions")
      .orderBy("createdAt", "desc")
      .get();

    return sessionsSnapshot.docs.map((doc) => {
      const raw = serializeTimestamps({
        id: doc.id,
        ...doc.data(),
      });
      // Normalize transactions from legacy format if needed
      if (raw.transactions && Array.isArray(raw.transactions)) {
        raw.transactions = raw.transactions.map(normalizeTransaction);
      }
      return raw as Session;
    });
  },

  async saveSession(userId: string, session: Omit<Session, "id">) {
    const sessionData = {
      ...session,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    const res = await db
      .collection("users")
      .doc(userId)
      .collection("sessions")
      .add(sessionData);
    await this.updateLastUpdated(userId);
    return res.id;
  },

  async updateSession(
    userId: string,
    sessionId: string,
    session: Partial<Session>,
  ) {
    const sessionData = {
      ...session,
      lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db
      .collection("users")
      .doc(userId)
      .collection("sessions")
      .doc(sessionId)
      .update(sessionData);
    await this.updateLastUpdated(userId);
  },

  async deleteSession(userId: string, sessionId: string) {
    await db
      .collection("users")
      .doc(userId)
      .collection("sessions")
      .doc(sessionId)
      .delete();
    await this.updateLastUpdated(userId);
  },
};
