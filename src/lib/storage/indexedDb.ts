import { openDB, IDBPDatabase } from "idb";
import { Session, UserData } from "@/types";

const DB_NAME = "expense-genie-db";
const DB_VERSION = 1;

export interface DBMetadata {
  id: string;
  lastSyncedAt: number;
}

const STORES = {
  SESSIONS: "sessions",
  USER_DATA: "userData",
};

class IndexedDBService {
  private dbPromise: Promise<IDBPDatabase> | null = null;

  private getDB() {
    if (!this.dbPromise) {
      this.dbPromise = openDB(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORES.SESSIONS)) {
            db.createObjectStore(STORES.SESSIONS, { keyPath: "id" });
          }
          if (!db.objectStoreNames.contains(STORES.USER_DATA)) {
            db.createObjectStore(STORES.USER_DATA, { keyPath: "userId" });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async saveSessions(sessions: Session[]) {
    const db = await this.getDB();
    const tx = db.transaction(STORES.SESSIONS, "readwrite");
    const store = tx.objectStore(STORES.SESSIONS);
    await Promise.all(sessions.map((session) => store.put(session)));
    await tx.done;
  }

  async getSessions(): Promise<Session[]> {
    const db = await this.getDB();
    return await db.getAll(STORES.SESSIONS);
  }

  async getSession(id: string): Promise<Session | undefined> {
    const db = await this.getDB();
    return await db.get(STORES.SESSIONS, id);
  }

  async saveUserData(userId: string, userData: UserData) {
    const db = await this.getDB();
    await db.put(STORES.USER_DATA, { ...userData, userId });
  }

  async getUserData(userId: string): Promise<UserData | undefined> {
    const db = await this.getDB();
    return await db.get(STORES.USER_DATA, userId);
  }

  async clearAll() {
    const db = await this.getDB();
    const tx = db.transaction([STORES.SESSIONS, STORES.USER_DATA], "readwrite");
    await Promise.all([
      tx.objectStore(STORES.SESSIONS).clear(),
      tx.objectStore(STORES.USER_DATA).clear(),
    ]);
    await tx.done;
  }
}

export const localDB = new IndexedDBService();
