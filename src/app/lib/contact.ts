export const WORK_HOURS_LABEL = 'Orari i punës';
export const WORK_DAYS = 'E hënë – E shtunë';
export const WORK_HOURS = '8:00 – 19:00';

export const PHONE_DISPLAY = '+383 48 195 195';
export const PHONE_E164 = '+38348195195';
export const PHONE_WHATSAPP = '38348195195';
export const PHONE_TEL_HREF = `tel:${PHONE_E164}`;
export const WHATSAPP_URL = `https://wa.me/${PHONE_WHATSAPP}`;

export const STORE_ADDRESS = 'Rruga e Pejës, Sllatinë e Madhe, Fushë Kosovë';
export const MAP_URL = 'https://www.google.com/maps?q=Kraslight+Showroom';
export const MAP_LABEL = 'Shiko në hartë';

export const COUNTRY_FLAG_CODES: Record<string, string> = {
  Kosovë: 'xk',
  Shqipëri: 'al',
  'Maqedoni e Veriut': 'mk',
  Greqi: 'gr',
  Itali: 'it',
  Gjermani: 'de',
  Francë: 'fr',
  Angli: 'gb',
  Turqi: 'tr',
  'Shtetet e Bashkuara': 'us',
};

export const SHIPPING_COUNTRIES = [
  { value: 'Kosovë', label: 'Kosovë', code: 'xk' },
  { value: 'Shqipëri', label: 'Shqipëri', code: 'al' },
  { value: 'Maqedoni e Veriut', label: 'Maqedoni e Veriut', code: 'mk' },
] as const;

export function getCountryFlagUrl(
  country: string,
  size: '16x12' | '20x15' | '24x18' = '24x18'
) {
  const code = COUNTRY_FLAG_CODES[country] ?? 'un';
  return `https://flagcdn.com/${size}/${code}.png`;
}
