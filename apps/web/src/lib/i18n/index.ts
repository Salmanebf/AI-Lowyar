export const locales = ['fr', 'ar'] as const;
export const defaultLocale = 'fr' satisfies Locale;

export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, () => Promise<Record<string, unknown>>> = {
  fr: () => import('./fr.json').then((m) => m.default),
  ar: () => import('./ar.json').then((m) => m.default),
};

export function isValidLocale(value: string): value is Locale {
  return locales.includes(value as Locale);
}

export async function getDictionary(locale: Locale) {
  const loader = dictionaries[locale];
  if (!loader) {
    return dictionaries[defaultLocale]() as Promise<{ home: { title: string } }>;
  }
  return loader() as Promise<{ home: { title: string } }>;
}
