import Providers from './Providers';
import './globals.css';

export const metadata = {
  title: 'TIMSCDR - Thakur Institute of Management Studies, Career Development & Research',
  description: 'Placement Portal for TIMSCDR - Thakur Institute of Management Studies, Career Development & Research',
  icons: {
    icon: '/logo.ico',
    shortcut: '/logo.ico',
    apple: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
