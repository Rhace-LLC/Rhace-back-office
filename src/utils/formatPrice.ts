/** Full Naira amount, e.g. ₦12,500 or ₦1,250.50. Use for all money values. */
const formatPrice = (amount: string | number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

/** Short Naira amount for stat tiles and charts, e.g. ₦950, ₦12.5K, ₦1.2M. */
export const formatPriceCompact = (amount: string | number): string =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(Number(amount) || 0);

export default formatPrice;
