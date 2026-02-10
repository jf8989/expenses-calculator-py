export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface Transaction {
  description: string;
  amount: number;
  payer?: string;
  assigned_to: string[];
  date: string;
  currency?: string; // currency code for this transaction (defaults to session's mainCurrency)
}

export interface Session {
  id?: string;
  name: string;
  description: string;
  transactions: Transaction[];
  participants: string[];
  mainCurrency: string;
  secondaryCurrency?: string;
  currencies: Record<string, number>; // additional currencies with exchange rates relative to mainCurrency
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
