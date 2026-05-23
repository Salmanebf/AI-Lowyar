import { getDictionary, type Locale } from '@/lib/i18n';

type Props = {
  params: { locale: Locale };
};

export default async function HomePage({ params }: Props) {
  const t = await getDictionary(params.locale);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-4xl font-bold">{t.home.title}</h1>
    </main>
  );
}
