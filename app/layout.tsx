import './globals.css';

export const metadata = {
  title: 'VES Solar Calculate',
  description: 'Solar Rooftop sizing and financial analysis by VES Solar Energy',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="th"><body>{children}</body></html>;
}
