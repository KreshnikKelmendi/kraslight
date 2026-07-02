/** Show product title as entered in admin (keeps hyphens, casing, and spacing). */
export function formatProductDisplayTitle(title: string): string {
  return title.replace(/\s+/g, ' ').trim();
}
