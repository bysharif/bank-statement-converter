import './globals.css'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/context/AuthContext'
import { ChatbaseWidget } from '@/components/ChatbaseWidget'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UK Bank Statement Converter - Convert Statements Instantly',
  description: 'Secure, private, and GDPR-compliant bank statement conversion for all major UK banks. Transform your statements to CSV, Excel, or QIF in seconds.',
  keywords: 'bank statement converter, UK banks, CSV, QIF, Excel, HSBC, Lloyds, Barclays, NatWest, Monzo',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-48x48.png', type: 'image/png', sizes: '48x48' },
      { url: '/android-chrome-192x192.png', type: 'image/png', sizes: '192x192' },
      { url: '/android-chrome-512x512.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
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
        <ChatbaseWidget />
      </body>
    </html>
  )
}
