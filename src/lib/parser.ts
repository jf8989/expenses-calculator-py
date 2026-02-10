import { Transaction } from "@/types";

export function parseTransactions(text: string, defaultPayer: string, allParticipants: string[]): Transaction[] {
  const lines = text.split("\n");
  const parsed = lines
    .map((line) => {
      // Matches DD/MM/YYYY : Description - Amount
      const match = line.match(
        /(\d{2}\/\d{2}\/\d{4})\s*:\s*(.+?)\s*-\s*([-\d.,]+)(?:\s*\(?.*\)?)?$/
      );
      if (match) {
        const [, date, description, amountStr] = match;
        const amount = parseFloat(amountStr.replace(/,/g, ""));
        if (isNaN(amount)) return null;

        return {
          date,
          description: description.trim(),
          amount,
          assigned_to: [...allParticipants],
        } as Transaction;
      }
      return null;
    })
    .filter((t): t is Transaction => t !== null);

  return parsed;
}
