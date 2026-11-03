/**
 * Format an amount in a program's or payment's currency.
 * Currency codes are stored lowercase like Stripe's ("usd", "eur"); missing means USD.
 * Whole amounts drop the cents ("€10,000") unless `decimals` is given (receipts use 2).
 */
export function formatCurrency(amount: number, currency?: string | null, decimals?: number): string {
  const digits = decimals ?? (Number.isInteger(amount) ? 0 : 2);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: (currency || "usd").toUpperCase(),
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount);
}
