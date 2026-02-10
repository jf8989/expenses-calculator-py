import { Transaction } from "@/types";

export interface ParticipantSummary {
  name: string;
  totalPaid: number;   // how much they actually paid out of pocket
  fairShare: number;    // their fair portion of what they consumed
  balance: number;      // positive = gets money back, negative = owes money
}

export interface Debt {
  from: string;
  to: string;
  amount: number;
}

/**
 * Calculate participant summaries with optional currency conversion.
 * @param transactions - list of transactions
 * @param participants - list of participant names
 * @param mainCurrency - the main currency code (all amounts normalized to this)
 * @param currencies - exchange rates: { "EUR": 0.92, "COP": 4200 } means 1 mainCurrency = rate of that currency
 */
export function calculateSummary(
  transactions: Transaction[],
  participants: string[],
  mainCurrency?: string,
  currencies?: Record<string, number>,
) {
  const summaries: Record<string, ParticipantSummary> = {};

  participants.forEach((p) => {
    summaries[p] = { name: p, totalPaid: 0, fairShare: 0, balance: 0 };
  });

  transactions.forEach((tx) => {
    // Add payer to summaries if not present
    if (tx.payer && !summaries[tx.payer]) {
      summaries[tx.payer] = {
        name: tx.payer,
        totalPaid: 0,
        fairShare: 0,
        balance: 0,
      };
    }
    // Add split participants to summaries if not present
    tx.assigned_to?.forEach((p) => {
      if (p && !summaries[p]) {
        summaries[p] = { name: p, totalPaid: 0, fairShare: 0, balance: 0 };
      }
    });

    const rawAmount = Number(tx.amount);
    if (isNaN(rawAmount) || rawAmount <= 0) return;

    // Convert to main currency if needed
    let amount = rawAmount;
    const txCurrency = tx.currency || mainCurrency;
    if (txCurrency && mainCurrency && txCurrency !== mainCurrency && currencies) {
      const rate = currencies[txCurrency];
      if (rate && rate > 0) {
        amount = rawAmount / rate;
      }
    }

    // Payer Mode: The person who paid gets credit
    if (tx.payer && summaries[tx.payer]) {
      summaries[tx.payer].totalPaid += amount;
    }

    // Each person's fair share of this expense (Simple OR Payer Mode)
    const splitCount = tx.assigned_to?.length || 0;
    if (splitCount > 0) {
      const share = amount / splitCount;
      tx.assigned_to.forEach((p) => {
        if (summaries[p]) {
          summaries[p].fairShare += share;
        }
      });
    }
  });

  // Positive balance = gets money back (overpaid), Negative = owes money (underpaid)
  Object.values(summaries).forEach((s) => {
    s.balance = s.totalPaid - s.fairShare;
  });

  return summaries;
}

export function calculateDebts(
  summaries: Record<string, ParticipantSummary>,
): Debt[] {
  const debts: Debt[] = [];
  const balances = Object.values(summaries)
    .map((s) => ({ name: s.name, balance: s.balance }))
    .filter((b) => Math.abs(b.balance) > 0.01);

  const debtors = balances
    .filter((b) => b.balance < 0)
    .sort((a, b) => a.balance - b.balance);
  const creditors = balances
    .filter((b) => b.balance > 0)
    .sort((a, b) => b.balance - a.balance);

  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(-debtor.balance, creditor.balance);

    debts.push({
      from: debtor.name,
      to: creditor.name,
      amount: Number(amount.toFixed(2)),
    });

    debtor.balance += amount;
    creditor.balance -= amount;

    if (Math.abs(debtor.balance) < 0.01) i++;
    if (Math.abs(creditor.balance) < 0.01) j++;
  }

  return debts;
}

// ─── Per-Currency Balances ───────────────────────────────────────────

export interface CurrencyDebt extends Debt {
  currency: string;
}

/**
 * Multi-currency summary: Record<currency, Record<participantName, ParticipantSummary>>
 */
export type MultiCurrencySummaries = Record<string, Record<string, ParticipantSummary>>;

/**
 * Calculate participant summaries separated by currency.
 * Each transaction stays in its own currency — NO conversion.
 */
export function calculateMultiCurrencySummary(
  transactions: Transaction[],
  participants: string[],
  mainCurrency: string = "USD",
): MultiCurrencySummaries {
  // Group transactions by currency
  const byCurrency: Record<string, Transaction[]> = {};
  transactions.forEach((tx) => {
    const cur = tx.currency || mainCurrency;
    if (!byCurrency[cur]) byCurrency[cur] = [];
    byCurrency[cur].push(tx);
  });

  const result: MultiCurrencySummaries = {};

  Object.entries(byCurrency).forEach(([currency, txs]) => {
    const summaries: Record<string, ParticipantSummary> = {};

    // Initialize all participants for this currency
    participants.forEach((p) => {
      summaries[p] = { name: p, totalPaid: 0, fairShare: 0, balance: 0 };
    });

    txs.forEach((tx) => {
      // Add payer if not present
      if (tx.payer && !summaries[tx.payer]) {
        summaries[tx.payer] = { name: tx.payer, totalPaid: 0, fairShare: 0, balance: 0 };
      }
      // Add split participants if not present
      tx.assigned_to?.forEach((p) => {
        if (p && !summaries[p]) {
          summaries[p] = { name: p, totalPaid: 0, fairShare: 0, balance: 0 };
        }
      });

      const amount = Number(tx.amount);
      if (isNaN(amount) || amount <= 0) return;

      // Credit the payer
      if (tx.payer && summaries[tx.payer]) {
        summaries[tx.payer].totalPaid += amount;
      }

      // Split fair share
      const splitCount = tx.assigned_to?.length || 0;
      if (splitCount > 0) {
        const share = amount / splitCount;
        tx.assigned_to.forEach((p) => {
          if (summaries[p]) {
            summaries[p].fairShare += share;
          }
        });
      }
    });

    // Compute balances
    Object.values(summaries).forEach((s) => {
      s.balance = s.totalPaid - s.fairShare;
    });

    // Only include this currency if there's meaningful activity
    const hasActivity = Object.values(summaries).some(
      (s) => s.totalPaid > 0.01 || s.fairShare > 0.01
    );
    if (hasActivity) {
      result[currency] = summaries;
    }
  });

  return result;
}

/**
 * Calculate debts per currency. Returns an array of CurrencyDebt.
 */
export function calculateMultiCurrencyDebts(
  multiSummaries: MultiCurrencySummaries,
): CurrencyDebt[] {
  const allDebts: CurrencyDebt[] = [];

  Object.entries(multiSummaries).forEach(([currency, summaries]) => {
    const debts = calculateDebts(summaries);
    debts.forEach((d) => {
      allDebts.push({ ...d, currency });
    });
  });

  return allDebts;
}
