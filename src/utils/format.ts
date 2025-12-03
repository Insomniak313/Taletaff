export const formatCurrencyRange = (min: number, max: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(min) +
  " - " +
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(max);

export const formatRelativeDate = (date: string) => {
  const formatter = new Intl.RelativeTimeFormat("fr", { numeric: "auto" });
  const target = new Date(date);
  const diff = target.getTime() - Date.now();
  const days = Math.round(diff / (1000 * 60 * 60 * 24));
  return formatter.format(days, "day");
};
