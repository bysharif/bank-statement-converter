import { Transaction } from './parsers';

/**
 * Universal merchant name cleaner that works across ALL UK banks
 * Handles 80-90% of cases using rules, leaving complex cases for AI enhancement
 */

export function cleanMerchantName(rawDescription: string, transactionType?: string): string {
  if (!rawDescription || rawDescription.trim() === '') return rawDescription;

  let cleaned = rawDescription.trim();

  // === UNIVERSAL BANK PATTERNS ===

  // Remove common bank prefixes (all UK banks use these)
  const prefixesToRemove = [
    /^CARD\s+(?:PAYMENT|PURCHASE|TRANSACTION)\s+(?:TO|AT|FROM)?\s*/i,
    /^DIRECT\s+DEBIT\s+(?:TO|FROM)?\s*/i,
    /^FASTER\s+PAYMENT\s+(?:TO|FROM)?\s*/i,
    /^STANDING\s+ORDER\s+(?:TO|FROM)?\s*/i,
    /^BANK\s+TRANSFER\s+(?:TO|FROM)?\s*/i,
    /^ATM\s+(?:WITHDRAWAL|CASH)?\s*/i,
    /^BACS\s+(?:PAYMENT)?\s*/i,
    /^CHAPS\s+(?:PAYMENT)?\s*/i,
    /^(?:FP|BGC|TFR|DD|SO)\s+/i,  // Common abbreviations
    /^Card transaction.*?issued by\s+/i, // Wise format
    /^(?:Sent money to|Received money from)\s+/i // Wise transfers
  ];

  prefixesToRemove.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // === PAYMENT PROCESSOR DETECTION (Universal) ===

  // PayPal (appears on all banks)
  if (/paypal\s*\*|pp\s*\*/i.test(cleaned)) {
    const merchant = cleaned.replace(/(?:paypal|pp)\s*\*\s*/i, '').split(/\s+/)[0];
    if (merchant && merchant.length > 2) {
      cleaned = `${capitalizeWords(merchant)} (via PayPal)`;
    } else {
      cleaned = 'PayPal Payment';
    }
  }

  // Square (SQ *)
  else if (/sq\s*\*|square\s*\*/i.test(cleaned)) {
    const merchant = cleaned.replace(/(?:sq|square)\s*\*\s*/i, '').trim();
    if (merchant && merchant.length > 2) {
      cleaned = `${capitalizeWords(merchant)} (via Square)`;
    } else {
      cleaned = 'Square Payment';
    }
  }

  // Stripe (various formats across banks)
  else if (/stripe/i.test(cleaned)) {
    // Extract actual merchant name after Stripe identifier
    const parts = cleaned.split(/[-\s]+/).filter(p => p.trim() && !/stripe|payments?|uk/i.test(p));
    if (parts.length > 0) {
      const merchantName = parts[parts.length - 1];
      if (merchantName && merchantName.length > 2) {
        cleaned = `${merchantName} (via Stripe)`;
      } else {
        cleaned = 'Stripe Payment';
      }
    } else {
      cleaned = 'Stripe Payment';
    }
  }

  // Google/Apple Pay
  else if (/(?:google|apple)\s*pay/i.test(cleaned)) {
    const match = cleaned.match(/(?:google|apple)\s*pay\s+(.+)/i);
    if (match && match[1]) {
      const provider = cleaned.match(/google/i) ? 'Google Pay' : 'Apple Pay';
      cleaned = `${capitalizeWords(match[1].trim())} (via ${provider})`;
    } else {
      cleaned = cleaned.match(/google/i) ? 'Google Pay' : 'Apple Pay';
    }
  }

  // Amazon (with order references)
  else if (/amazon/i.test(cleaned)) {
    const match = cleaned.match(/amazon\*?\s*([a-z0-9]+)?/i);
    if (match && match[1]) {
      cleaned = `Amazon (Order: ${match[1].toUpperCase()})`;
    } else {
      cleaned = 'Amazon';
    }
  }

  // Uber (various formats)
  else if (/ubr?\*?|uber/i.test(cleaned)) {
    if (/trip|ride/i.test(cleaned)) {
      cleaned = 'Uber Ride';
    } else if (/eats|food/i.test(cleaned)) {
      cleaned = 'Uber Eats';
    } else {
      cleaned = 'Uber';
    }
  }

  // === REMOVE REFERENCE CODES (Universal) ===

  // Remove all common reference formats
  cleaned = cleaned.replace(/\s+REF:?\s*[A-Z0-9-]+/gi, '');
  cleaned = cleaned.replace(/\s+[A-Z]{2,}\d{6,}/gi, ''); // e.g., "REF123456"
  cleaned = cleaned.replace(/ref:[a-f0-9-]{36}/gi, ''); // UUIDs
  cleaned = cleaned.replace(/\s+#\d+/g, ''); // Transaction numbers
  cleaned = cleaned.replace(/\s+with reference.*$/i, ''); // Wise references

  // === REMOVE LOCATION CODES (Universal) ===

  // Remove trailing country/city codes
  cleaned = cleaned.replace(/,?\s+(?:GB|UK|LONDON|MANCHESTER|BIRMINGHAM|CARDIFF|GLASGOW|EDINBURGH|BRISTOL|LEEDS|SHEFFIELD|LIVERPOOL|NEWCASTLE)\s*$/i, '');
  cleaned = cleaned.replace(/\s+(?:GBR?|USA?|EUR?|GBP|USD|EUR)\s*$/i, '');

  // === WEBSITE/DOMAIN CLEANUP (Universal) ===

  // Remove www. prefix
  cleaned = cleaned.replace(/^www\./i, '');

  // Convert common domain patterns to business names
  const domainMatch = cleaned.match(/^([a-z0-9-]+)\.(com|co\.uk|org|net|io|uk)$/i);
  if (domainMatch) {
    // Convert domain to proper name: "madesimplegroup.co" → "Made Simple Group"
    const domainName = domainMatch[1]
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    cleaned = domainName;
  }

  // Remove .com/.co.uk from end if merchant name is clear
  cleaned = cleaned.replace(/\s*\.(?:com|co\.uk|org|net|io)\s*$/i, '');

  // Handle "madesimplegroup.co" type cases
  if (/^[a-z0-9-]+\.(?:co|com|uk)$/i.test(cleaned)) {
    const domain = cleaned.split('.')[0];
    cleaned = domain
      .split(/[-_]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }

  // === REMOVE CORPORATE SUFFIXES (Universal) ===

  cleaned = cleaned.replace(/\s+(?:Ltd\.?|Limited|Inc\.?|Corp\.?|Corporation|Plc\.?|With)\s*$/i, '');

  // === REMOVE DUPLICATE WORDS (Universal) ===

  // "Whoop WHOOP.COM" → "Whoop"
  const words = cleaned.split(/\s+/);
  const uniqueWords: string[] = [];
  const seenLower = new Set<string>();

  words.forEach(word => {
    const normalized = word.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalized && !seenLower.has(normalized)) {
      uniqueWords.push(word);
      seenLower.add(normalized);
    }
  });
  cleaned = uniqueWords.join(' ');

  // === BRAND CAPITALIZATION (Universal) ===

  // Common brands that appear across all banks
  const brandMap: Record<string, string> = {
    'paypal': 'PayPal',
    'youtube': 'YouTube',
    'linkedin': 'LinkedIn',
    'quickbooks': 'QuickBooks',
    'qbooks': 'QuickBooks',
    'netflix': 'Netflix',
    'spotify': 'Spotify',
    'amazon': 'Amazon',
    'ebay': 'eBay',
    'facebook': 'Facebook',
    'instagram': 'Instagram',
    'whatsapp': 'WhatsApp',
    'tiktok': 'TikTok',
    'icloud': 'iCloud',
    'itunes': 'iTunes',
    'airbnb': 'Airbnb',
    'uber': 'Uber',
    'deliveroo': 'Deliveroo',
    'just eat': 'Just Eat',
    'justeat': 'Just Eat',
    'tesco': 'Tesco',
    'sainsbury': "Sainsbury's",
    'sainsburys': "Sainsbury's",
    'asda': 'Asda',
    'morrisons': 'Morrisons',
    'waitrose': 'Waitrose',
    'mcdonalds': "McDonald's",
    'costa': 'Costa',
    'starbucks': 'Starbucks',
    'pret': 'Pret A Manger',
    'greggs': 'Greggs',
    'notion': 'Notion',
    'claude': 'Claude AI',
    'anthropic': 'Anthropic',
    'openai': 'OpenAI',
    'github': 'GitHub',
    'microsoft': 'Microsoft',
    'google': 'Google',
    'apple': 'Apple',
    'whoop': 'Whoop'
  };

  Object.entries(brandMap).forEach(([incorrect, correct]) => {
    const regex = new RegExp(`\\b${incorrect}\\b`, 'gi');
    cleaned = cleaned.replace(regex, correct);
  });

  // === FINAL CLEANUP ===

  // === FINAL FORMATTING ===

  // Clean up extra whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Handle all-caps names (convert to title case for person names)
  if (/^[A-Z\s]{4,}$/.test(cleaned) && !cleaned.includes('*') && !cleaned.includes('.')) {
    // Looks like a person name in all caps
    cleaned = capitalizeWords(cleaned);
  }

  // Handle mixed case improvements
  if (!/^[A-Z]/.test(cleaned) && cleaned.length > 2) {
    // First letter should be capitalized
    cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
  }

  // If we ended up with empty string, return original
  if (!cleaned || cleaned.trim() === '') {
    return rawDescription.trim();
  }

  // If description is too short after cleaning, might be over-cleaned
  if (cleaned.length < 2) {
    return rawDescription;
  }

  return cleaned;
}

function capitalizeWords(text: string): string {
  return text.toLowerCase()
    .split(' ')
    .map(word => {
      if (word.length === 0) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Check if a description needs AI enhancement
 */
export function needsAIEnhancement(description: string): boolean {
  return (
    description.length > 50 || // Too long
    /\s{2,}/.test(description) || // Multiple spaces
    /[^a-zA-Z0-9\s\-'()&.,]/.test(description) || // Weird characters
    description.split(' ').length > 8 || // Too many words
    /\b(?:with|and|the|of|for|in|at|on|by)\b.*\b(?:with|and|the|of|for|in|at|on|by)\b/i.test(description) // Repetitive words
  );
}

/**
 * Calculate quality score for descriptions
 */
export function calculateDescriptionQuality(transactions: Transaction[]): number {
  if (transactions.length === 0) return 100;

  const goodDescriptions = transactions.filter(t =>
    t.description &&
    t.description !== 'Transaction' &&
    t.description.length >= 3 &&
    t.description.length <= 50 &&
    !t.description.includes('ref:') &&
    !needsAIEnhancement(t.description)
  );

  return (goodDescriptions.length / transactions.length) * 100;
}