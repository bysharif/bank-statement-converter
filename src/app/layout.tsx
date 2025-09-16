import './globals.css'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'UK Bank Statement Converter - Convert Statements Instantly',
  description: 'Secure, private, and GDPR-compliant bank statement conversion for all major UK banks. Transform your statements to CSV, Excel, or QIF in seconds.',
  keywords: 'bank statement converter, UK banks, CSV, QIF, Excel, HSBC, Lloyds, Barclays, NatWest, Monzo',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}
