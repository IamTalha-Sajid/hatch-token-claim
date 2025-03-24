import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hatch Token Interface',
  description: 'Interface for Hatch Token contract - generate merkle trees, update merkle roots, and claim tokens',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
