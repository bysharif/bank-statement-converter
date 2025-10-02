export interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'debit' | 'credit'
  balance?: number
}

export function generateCSVContent(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Type', 'Amount', 'Balance']

  const rows = transactions.map(transaction => [
    transaction.date,
    `"${transaction.description}"`, // Quote description to handle commas
    transaction.type,
    transaction.amount.toFixed(2),
    transaction.balance?.toFixed(2) || ''
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

// Generate 50 mock transactions for free preview
export function generateMockTransactions(fileName: string): { preview: Transaction[], total: number } {
  const mockTransactions: Transaction[] = [
    {
      id: '1',
      date: '2024-01-25',
      description: 'TESCO STORE 2847 LONDON',
      amount: 45.67,
      type: 'debit',
      balance: 1234.56
    },
    {
      id: '2',
      date: '2024-01-24',
      description: 'SALARY PAYMENT - ACME LTD',
      amount: 2500.00,
      type: 'credit',
      balance: 1280.23
    },
    {
      id: '3',
      date: '2024-01-23',
      description: 'AMAZON PRIME SUBSCRIPTION',
      amount: 8.99,
      type: 'debit',
      balance: -2219.77
    },
    {
      id: '4',
      date: '2024-01-22',
      description: 'CONTACTLESS PAYMENT TFL',
      amount: 12.40,
      type: 'debit',
      balance: -2210.78
    },
    {
      id: '5',
      date: '2024-01-21',
      description: 'INTEREST PAYMENT',
      amount: 2.34,
      type: 'credit',
      balance: -2198.38
    },
    {
      id: '6',
      date: '2024-01-20',
      description: 'SAINSBURYS SUPERSTORE',
      amount: 67.23,
      type: 'debit',
      balance: -2200.72
    },
    {
      id: '7',
      date: '2024-01-19',
      description: 'SPOTIFY PREMIUM',
      amount: 9.99,
      type: 'debit',
      balance: -2133.49
    },
    {
      id: '8',
      date: '2024-01-18',
      description: 'FREELANCE PAYMENT - CLIENT A',
      amount: 750.00,
      type: 'credit',
      balance: -2123.50
    },
    {
      id: '9',
      date: '2024-01-17',
      description: 'UBER RIDE',
      amount: 15.60,
      type: 'debit',
      balance: -2873.50
    },
    {
      id: '10',
      date: '2024-01-16',
      description: 'NETFLIX SUBSCRIPTION',
      amount: 12.99,
      type: 'debit',
      balance: -2857.90
    },
    {
      id: '11',
      date: '2024-01-15',
      description: 'JOHN LEWIS OXFORD ST',
      amount: 89.50,
      type: 'debit',
      balance: -2844.91
    },
    {
      id: '12',
      date: '2024-01-14',
      description: 'CASH WITHDRAWAL',
      amount: 50.00,
      type: 'debit',
      balance: -2755.41
    },
    {
      id: '13',
      date: '2024-01-13',
      description: 'ELECTRICITY BILL - EDF',
      amount: 78.45,
      type: 'debit',
      balance: -2705.41
    },
    {
      id: '14',
      date: '2024-01-12',
      description: 'COSTA COFFEE',
      amount: 4.85,
      type: 'debit',
      balance: -2626.96
    },
    {
      id: '15',
      date: '2024-01-11',
      description: 'REFUND - AMAZON',
      amount: 23.99,
      type: 'credit',
      balance: -2622.11
    },
    {
      id: '16',
      date: '2024-01-10',
      description: 'MORTGAGE PAYMENT',
      amount: 1250.00,
      type: 'debit',
      balance: -2646.10
    },
    {
      id: '17',
      date: '2024-01-09',
      description: 'COUNCIL TAX',
      amount: 156.78,
      type: 'debit',
      balance: -1396.10
    },
    {
      id: '18',
      date: '2024-01-08',
      description: 'WAITROSE & PARTNERS',
      amount: 34.67,
      type: 'debit',
      balance: -1239.32
    },
    {
      id: '19',
      date: '2024-01-07',
      description: 'FREELANCE PAYMENT - CLIENT B',
      amount: 425.00,
      type: 'credit',
      balance: -1204.65
    },
    {
      id: '20',
      date: '2024-01-06',
      description: 'GOOGLE STORAGE',
      amount: 1.99,
      type: 'debit',
      balance: -1629.65
    },
    {
      id: '21',
      date: '2024-01-05',
      description: 'MARKS & SPENCER',
      amount: 45.20,
      type: 'debit',
      balance: -1627.66
    },
    {
      id: '22',
      date: '2024-01-04',
      description: 'BROADBAND BILL - BT',
      amount: 29.99,
      type: 'debit',
      balance: -1582.46
    },
    {
      id: '23',
      date: '2024-01-03',
      description: 'INSURANCE PREMIUM',
      amount: 87.50,
      type: 'debit',
      balance: -1552.47
    },
    {
      id: '24',
      date: '2024-01-02',
      description: 'ASDA GROCERIES',
      amount: 52.34,
      type: 'debit',
      balance: -1464.97
    },
    {
      id: '25',
      date: '2024-01-01',
      description: 'NEW YEAR BONUS',
      amount: 200.00,
      type: 'credit',
      balance: -1412.63
    },
    {
      id: '26',
      date: '2023-12-31',
      description: 'ATM WITHDRAWAL',
      amount: 100.00,
      type: 'debit',
      balance: -1612.63
    },
    {
      id: '27',
      date: '2023-12-30',
      description: 'CONTACTLESS PAYMENT - PRET A MANGER',
      amount: 7.95,
      type: 'debit',
      balance: -1512.63
    },
    {
      id: '28',
      date: '2023-12-29',
      description: 'ONLINE TRANSFER FROM SAVINGS',
      amount: 500.00,
      type: 'credit',
      balance: -1504.68
    },
    {
      id: '29',
      date: '2023-12-28',
      description: 'ARGOS RETAIL GROUP',
      amount: 129.99,
      type: 'debit',
      balance: -2004.68
    },
    {
      id: '30',
      date: '2023-12-27',
      description: 'PETROL STATION - SHELL',
      amount: 65.40,
      type: 'debit',
      balance: -1874.69
    },
    {
      id: '31',
      date: '2023-12-26',
      description: 'BOXING DAY REFUND - CURRYS',
      amount: 89.99,
      type: 'credit',
      balance: -1809.29
    },
    {
      id: '32',
      date: '2023-12-25',
      description: 'CHRISTMAS DINNER - DELIVEROO',
      amount: 45.60,
      type: 'debit',
      balance: -1899.28
    },
    {
      id: '33',
      date: '2023-12-24',
      description: 'LAST MINUTE GIFT - AMAZON',
      amount: 24.99,
      type: 'debit',
      balance: -1853.68
    },
    {
      id: '34',
      date: '2023-12-23',
      description: 'CHRISTMAS FOOD SHOP - MORRISONS',
      amount: 87.34,
      type: 'debit',
      balance: -1828.69
    },
    {
      id: '35',
      date: '2023-12-22',
      description: 'TRAIN TICKET - TRAINLINE',
      amount: 45.80,
      type: 'debit',
      balance: -1741.35
    },
    {
      id: '36',
      date: '2023-12-21',
      description: 'CHRISTMAS BONUS - EMPLOYER',
      amount: 1000.00,
      type: 'credit',
      balance: -1695.55
    },
    {
      id: '37',
      date: '2023-12-20',
      description: 'UTILITIES - BRITISH GAS',
      amount: 156.78,
      type: 'debit',
      balance: -2695.55
    },
    {
      id: '38',
      date: '2023-12-19',
      description: 'PHARMACY - BOOTS',
      amount: 12.45,
      type: 'debit',
      balance: -2538.77
    },
    {
      id: '39',
      date: '2023-12-18',
      description: 'MOBILE PHONE BILL - O2',
      amount: 35.00,
      type: 'debit',
      balance: -2526.32
    },
    {
      id: '40',
      date: '2023-12-17',
      description: 'WEEKEND GROCERY SHOP - LIDL',
      amount: 42.67,
      type: 'debit',
      balance: -2491.32
    },
    {
      id: '41',
      date: '2023-12-16',
      description: 'FREELANCE PROJECT PAYMENT',
      amount: 800.00,
      type: 'credit',
      balance: -2448.65
    },
    {
      id: '42',
      date: '2023-12-15',
      description: 'OFFICE SUPPLIES - STAPLES',
      amount: 23.99,
      type: 'debit',
      balance: -3248.65
    },
    {
      id: '43',
      date: '2023-12-14',
      description: 'RESTAURANT - PIZZA EXPRESS',
      amount: 38.50,
      type: 'debit',
      balance: -3224.66
    },
    {
      id: '44',
      date: '2023-12-13',
      description: 'CINEMA TICKETS - ODEON',
      amount: 18.00,
      type: 'debit',
      balance: -3186.16
    },
    {
      id: '45',
      date: '2023-12-12',
      description: 'PARKING FINE PAYMENT',
      amount: 65.00,
      type: 'debit',
      balance: -3168.16
    },
    {
      id: '46',
      date: '2023-12-11',
      description: 'BOOK PURCHASE - WATERSTONES',
      amount: 15.99,
      type: 'debit',
      balance: -3103.16
    },
    {
      id: '47',
      date: '2023-12-10',
      description: 'SALARY PAYMENT - MAIN JOB',
      amount: 2800.00,
      type: 'credit',
      balance: -3087.17
    },
    {
      id: '48',
      date: '2023-12-09',
      description: 'CONTACTLESS - COSTA COFFEE',
      amount: 4.25,
      type: 'debit',
      balance: -5887.17
    },
    {
      id: '49',
      date: '2023-12-08',
      description: 'ONLINE SHOPPING - NEXT',
      amount: 67.99,
      type: 'debit',
      balance: -5882.92
    },
    {
      id: '50',
      date: '2023-12-07',
      description: 'BANK TRANSFER TO SAVINGS',
      amount: 300.00,
      type: 'debit',
      balance: -5814.93
    }
  ]

  // Simulate realistic bank statement sizes based on file name and size
  // Most personal bank statements have 100-400 transactions per month
  // Business accounts can have 500-2000+ transactions
  const baseTransactionCount = fileName.toLowerCase().includes('business') || fileName.toLowerCase().includes('corporate')
    ? Math.floor(Math.random() * 1500) + 500 // Business: 500-2000 transactions
    : Math.floor(Math.random() * 300) + 100   // Personal: 100-400 transactions

  return {
    preview: mockTransactions.slice(0, 3), // Now returns 3 transactions for preview
    total: baseTransactionCount
  }
}