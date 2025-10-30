
import type { Metadata } from 'next';
import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';
import Provider from '@/components/Provider';

export const metadata: Metadata = {
  title: 'AI Email Classifier',
  description: 'Automatically classify your emails with the power of AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-animated-gradient bg-400% animate-gradient-bg font-sans text-light-900">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
