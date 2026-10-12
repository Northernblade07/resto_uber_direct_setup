import './globals.css';

export const metadata = {
  title: 'Uber Direct Setup',
  description: 'Internal tool for creating Uber Direct organizations and inviting their admins.',
  robots: { index: false, follow: false },
};

export const viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f6f4' },
    { media: '(prefers-color-scheme: dark)', color: '#0e0f10' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
