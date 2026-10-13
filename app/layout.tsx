import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Somto Wisdom | Web Developer',
    template: '%s | Somto Wisdom',
  },
  description:
    'Portfolio website for Somto Wisdom, featuring responsive web projects, services, and contact details.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
