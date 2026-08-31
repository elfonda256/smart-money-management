import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { FinancialProvider } from '@/lib/store/FinancialContext';
import { AppShell } from '@/components/layout/AppShell';

const fontSans = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'SmartMoney - Voice Reporting & Intelligent Family Finance',
  description: 'Aplikasi manajemen keuangan keluarga pintar dengan input transaksi dan pelaporan suara interaktif berbasis AI.',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="light">
      <body className={`${fontSans.className} antialiased selection:bg-[#005CE6] selection:text-white`}>
        <FinancialProvider>
          <AppShell>
            {children}
          </AppShell>
        </FinancialProvider>
      </body>
    </html>
  );
}
