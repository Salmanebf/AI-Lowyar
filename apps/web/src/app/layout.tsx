import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MoroLex',
  description: 'Assistant juridique IA pour le droit marocain',
};

type Props = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="fr" dir="ltr">
      <body>{children}</body>
    </html>
  );
}
