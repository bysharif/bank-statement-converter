import { Transaction } from './parsers';
import { needsAIEnhancement } from './merchant-cleaner';

/**
 * AI-powered description enhancement for complex cases
 * Only used when rule-based cleaning isn't sufficient
 */

// Simple AI enhancement using Claude (if API key available)
export async function enhanceDescriptionsWithAI(transactions: Transaction[]): Promise<Transaction[]> {
  // Only enhance descriptions that still look problematic after rule-based cleaning
  const needsEnhancement = transactions.filter(t => needsAIEnhancement(t.description));

  if (needsEnhancement.length === 0) {
    console.log('✅ All descriptions look good, skipping AI enhancement');
    return transactions;
  }

  console.log(`🤖 ${needsEnhancement.length} descriptions need AI enhancement...`);

  // Check if AI is available and configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.log('⚠️ No ANTHROPIC_API_KEY found, skipping AI enhancement');
    return transactions;
  }

  try {
    // Try to import Anthropic SDK
    const Anthropic = await import('@anthropic-ai/sdk');
    const anthropic = new Anthropic.default({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('🤖 Enhancing descriptions with Claude AI...');

    // Process in small batches to avoid rate limits
    const batchSize = 5;
    const enhanced: Transaction[] = [];

    for (let i = 0; i < needsEnhancement.length; i += batchSize) {
      const batch = needsEnhancement.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        batch.map(async (transaction) => {
          try {
            const message = await anthropic.messages.create({
              model: 'claude-3-5-sonnet-20241022',
              max_tokens: 50,
              temperature: 0,
              messages: [{
                role: 'user',
                content: `Clean this bank transaction description to be concise and readable. Remove payment processor prefixes, reference codes, location codes, duplicates, and format merchant/person names properly. Return ONLY the cleaned merchant/person name, nothing else.

Original: "${transaction.description}"
Transaction type: ${transaction.type}
Amount: £${transaction.amount}

Cleaned name:`
              }]
            });

            const cleaned = message.content[0].type === 'text'
              ? message.content[0].text.trim()
              : transaction.description;

            // Validate AI response
            if (cleaned && cleaned.length > 0 && cleaned.length <= 50 && !cleaned.includes('I cannot') && !cleaned.includes('sorry')) {
              console.log(`🎯 AI enhanced: "${transaction.description}" → "${cleaned}"`);
              return {
                ...transaction,
                description: cleaned
              };
            } else {
              console.log(`⚠️ AI response invalid for: "${transaction.description}"`);
              return transaction;
            }
          } catch (error) {
            console.error('AI enhancement failed for:', transaction.description, error);
            return transaction; // Return original if AI fails
          }
        })
      );

      enhanced.push(...batchResults);

      // Small delay between batches to respect rate limits
      if (i + batchSize < needsEnhancement.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Merge enhanced descriptions back into full list
    const enhancedMap = new Map(enhanced.map(t => [t.transactionId, t]));
    const result = transactions.map(t => enhancedMap.get(t.transactionId) || t);

    console.log(`✅ AI enhancement complete: ${enhanced.length} descriptions improved`);
    return result;

  } catch (error) {
    console.error('AI enhancement service unavailable:', error);
    console.log('📝 Falling back to rule-based descriptions only');
    return transactions;
  }
}

/**
 * Simple local AI enhancement using pattern matching (fallback)
 * Used when Claude API is not available
 */
export function enhanceDescriptionsLocally(transactions: Transaction[]): Transaction[] {
  console.log('🔧 Applying local description enhancement...');

  return transactions.map(transaction => {
    let description = transaction.description;

    // Apply additional local patterns for common cases
    if (needsAIEnhancement(description)) {
      // Try to extract the most relevant part
      const words = description.split(/\s+/);

      // If too many words, try to find the merchant name (usually first meaningful word)
      if (words.length > 6) {
        // Look for proper nouns or branded terms
        const meaningfulWords = words.filter(word =>
          word.length > 2 &&
          (word[0] === word[0].toUpperCase() || /^[A-Z]{2,}/.test(word))
        );

        if (meaningfulWords.length > 0) {
          description = meaningfulWords.slice(0, 3).join(' ');
        } else {
          // Fallback to first few words
          description = words.slice(0, 3).join(' ');
        }
      }

      // Remove common filler words
      description = description.replace(/\b(?:the|and|of|for|with|in|at|on|by|to|from)\b/gi, ' ');
      description = description.replace(/\s+/g, ' ').trim();

      console.log(`🔧 Local enhance: "${transaction.description}" → "${description}"`);
    }

    return {
      ...transaction,
      description: description || transaction.description
    };
  });
}

/**
 * Main enhancement function with fallback strategy
 */
export async function enhanceDescriptions(
  transactions: Transaction[],
  useAI: boolean = true
): Promise<Transaction[]> {
  if (!useAI) {
    return enhanceDescriptionsLocally(transactions);
  }

  try {
    return await enhanceDescriptionsWithAI(transactions);
  } catch (error) {
    console.log('🔄 AI enhancement failed, falling back to local enhancement');
    return enhanceDescriptionsLocally(transactions);
  }
}