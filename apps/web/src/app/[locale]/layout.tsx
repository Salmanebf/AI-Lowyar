import { locales, type Locale } from '@/lib/i18n';
import { LocaleAttrs } from '@/components/locale-attrs';

type Props = {
  children: React.ReactNode;
  params: { locale: Locale };
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function LocaleLayout({ children, params }: Props) {
  return (
    <>
      <LocaleAttrs locale={params.locale} />
      {children}
    </>
  );
}
