/** Zero is an explicit free price, including for active menu items. */
export function formatPrice(price: number, locale: string) {
  if (price === 0) {
    if (locale === "he") return "ללא תשלום";
    if (locale === "fr") return "Gratuit";
    return "Free of charge";
  }
  return locale === "he" ? `${price} ₪` : `${price}`;
}
