import type { Metadata } from 'next';
import App from './App';
import './globals.css';

export const metadata: Metadata = {
  title: 'LearnDoSwap',
  description: 'A cross-chain swap for educhain',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <App>{children}</App>
      </body>
    </html>
  );
}
