import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KINNIPAW — One Platform. Every Animal. One Connected Ecosystem.',
  description:
    'Bangladesh-first animal community, responsible care, adoption, lost-and-found, and rescue coordination ecosystem.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
