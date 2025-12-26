import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Santa Barbara Tour - Tesla FSD',
  description: 'Automated tour guide for Tesla vehicles using FSD',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
