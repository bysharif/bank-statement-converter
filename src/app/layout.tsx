import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UK Bank Statement Converter - Convert Statements Instantly',
  description: 'Secure, private, and GDPR-compliant bank statement conversion for all major UK banks. Transform your statements to CSV, Excel, or QIF in seconds.',
  keywords: 'bank statement converter, UK banks, CSV, QIF, Excel, HSBC, Lloyds, Barclays, NatWest, Monzo',
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
      { url: '/logo.svg', type: 'image/svg+xml' },
    ],
    apple: [
      { url: '/icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
