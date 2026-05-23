export const locales = ['fr', 'ar'] as const;
export const defaultLocale = 'fr' satisfies Locale;

export type Locale = (typeof locales)[number];

const dictionaries: Record<Locale, () => Promise<Record<string, unknown>>> = {
  fr: () => import('./fr.json').then((m) => m.default),
  ar: () => import('./ar.json').then((m) => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]() as Promise<{ home: { title: string } }>;
}
