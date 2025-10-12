/**
 * Test script to verify Monzo parser works correctly
 * Run with: npx tsx tests/test-monzo-parser.ts
 */

import { parseMonzoStatement, isMonzoStatement } from '../src/lib/monzo-parser'

// Sample Monzo statement text (from the provided PDF)
const sampleMonzoText = `
Personal Account statement
01/09/2025 - 21/09/2025

Natasha Ann Coventry-Marshall
Sort code: 04-00-04
Account number: 29194441
BIC: MONZGB2L

Date Description (GBP) Amount (GBP) Balance

21/09/2025 Transfer to Pot -3.00 -999.85
21/09/2025 Klarna*Klarna London GBR -12.00 -996.85
21/09/2025 Sharif Kouthoofd (Faster Payments) 10.00 -984.85
21/09/2025 BOOTS 0884 LONDON GBR -9.90 -994.85
21/09/2025 Transfer from Pot 12.99 -984.95
`

console.log('🧪 Testing Monzo Parser...\n')

// Test 1: Detection
console.log('Test 1: Monzo Statement Detection')
const isMonzo = isMonzoStatement(sampleMonzoText)
console.log(`Result: ${isMonzo ? '✅ PASS' : '❌ FAIL'}`)
console.log(`Expected: true, Got: ${isMonzo}\n`)

// Test 2: Parsing
console.log('Test 2: Transaction Parsing')
const result = parseMonzoStatement(sampleMonzoText)
console.log(`Transactions found: ${result.transactions.length}`)
console.log(`Expected: 5, Got: ${result.transactions.length}`)
console.log(result.transactions.length === 5 ? '✅ PASS' : '❌ FAIL')
console.log()

// Test 3: Metadata Extraction
console.log('Test 3: Metadata Extraction')
console.log(`Sort Code: ${result.sortCode} (Expected: 04-00-04)`)
console.log(`Account Number: ${result.accountNumber} (Expected: 29194441)`)
console.log(result.sortCode === '04-00-04' && result.accountNumber === '29194441' ? '✅ PASS' : '❌ FAIL')
console.log()

// Test 4: First Transaction Details
if (result.transactions.length > 0) {
  console.log('Test 4: First Transaction Details')
  const firstTx = result.transactions[0]
  console.log(`Date: ${firstTx.date} (Expected: 2025-09-21)`)
  console.log(`Description: ${firstTx.description}`)
  console.log(`Amount: £${firstTx.amount} (Expected: 3.00)`)
  console.log(`Type: ${firstTx.type} (Expected: debit)`)
  console.log(`Balance: £${firstTx.balance} (Expected: -999.85)`)
  
  const isCorrect = firstTx.date === '2025-09-21' && 
                    firstTx.amount === 3.00 && 
                    firstTx.type === 'debit' &&
                    firstTx.balance === -999.85
  
  console.log(isCorrect ? '✅ PASS' : '❌ FAIL')
  console.log()
}

// Test 5: Credit Transaction (3rd transaction)
if (result.transactions.length >= 3) {
  console.log('Test 5: Credit Transaction Detection')
  const creditTx = result.transactions[2]
  console.log(`Description: ${creditTx.description}`)
  console.log(`Amount: £${creditTx.amount} (Expected: 10.00)`)
  console.log(`Type: ${creditTx.type} (Expected: credit)`)
  
  const isCorrect = creditTx.amount === 10.00 && creditTx.type === 'credit'
  console.log(isCorrect ? '✅ PASS' : '❌ FAIL')
  console.log()
}

// Test 6: CSV Format Test
import { generateCSVContent } from '../src/lib/csv-utils'

console.log('Test 6: CSV Format with Separate Columns')
if (result.transactions.length > 0) {
  const csvContent = generateCSVContent(result.transactions.slice(0, 3))
  console.log('Generated CSV:')
  console.log(csvContent)
  console.log()
  
  const hasDebitColumn = csvContent.includes('Debit')
  const hasCreditColumn = csvContent.includes('Credit')
  const hasCorrectHeaders = csvContent.startsWith('Date,Description,Debit,Credit,Balance')
  
  console.log(`Has Debit column: ${hasDebitColumn ? '✅' : '❌'}`)
  console.log(`Has Credit column: ${hasCreditColumn ? '✅' : '❌'}`)
  console.log(`Correct header format: ${hasCorrectHeaders ? '✅' : '❌'}`)
  console.log(hasDebitColumn && hasCreditColumn && hasCorrectHeaders ? '✅ PASS' : '❌ FAIL')
}

console.log('\n🏁 Testing Complete!')
