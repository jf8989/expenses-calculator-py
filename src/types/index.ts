export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Transaction {
  description: string;
  amount: number;
  payer: string;
  splitWith: string[];
  date: string;
}

export interface Session {
  id?: string;
  name: string;
  description: string;
  transactions: Transaction[];
  participants: string[];
  currencies: Record<string, number>;
  createdAt?: Timestamp;
  lastUpdatedAt?: Timestamp;
}

export interface UserMetadata {
  lastUpdatedAt: Timestamp;
}

export interface UserData {
  participants: string[];
  frequentParticipants: string[];
  metadata: UserMetadata;
}
