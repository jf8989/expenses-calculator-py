import { Transaction } from "@/types";

export interface ParticipantSummary {
  name: string;
  totalSpent: number;
  totalOwed: number;
  balance: number;
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

export function calculateSummary(transactions: Transaction[], participants: string[]) {
  const summaries: Record<string, ParticipantSummary> = {};
  
  participants.forEach(p => {
    summaries[p] = { name: p, totalSpent: 0, totalOwed: 0, balance: 0 };
  });

  transactions.forEach(tx => {
    const amount = Number(tx.amount);
    if (isNaN(amount) || amount <= 0) return;

    // The person who paid
    if (summaries[tx.payer]) {
      summaries[tx.payer].totalSpent += amount;
    }

    // Splitting the amount
    const splitCount = tx.splitWith?.length || 0;
    if (splitCount > 0) {
      const share = amount / splitCount;
      tx.splitWith.forEach(p => {
        if (summaries[p]) {
          summaries[p].totalOwed += share;
        }
      });
    }
  });

  // Calculate balance (Positive means they are owed money, Negative means they owe)
  Object.values(summaries).forEach(s => {
    s.balance = s.totalSpent - s.totalOwed;
  });

  return summaries;
}

export function calculateDebts(summaries: Record<string, ParticipantSummary>): Debt[] {
  const debts: Debt[] = [];
  const balances = Object.values(summaries)
    .map(s => ({ name: s.name, balance: s.balance }))
    .filter(b => Math.abs(b.balance) > 0.01);

  const debtors = balances.filter(b => b.balance < 0).sort((a, b) => a.balance - b.balance);
  const creditors = balances.filter(b => b.balance > 0).sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    debts.push({
      from: debtor.name,
      to: creditor.name,
      amount: Number(amount.toFixed(2))
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return debts;
}
