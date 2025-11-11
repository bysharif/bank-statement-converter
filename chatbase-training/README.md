# Chatbase Training Documents - README

## Overview

This folder contains comprehensive training documents for setting up your ConvertBank-Statement.com chatbot on Chatbase. These documents provide the AI with deep knowledge about your service, enabling it to answer customer questions accurately and professionally.

## Documents Included

### 1. chatbase-training-main-service.md
**Purpose**: Core service information

**Contains**:
- Complete service description and value propositions
- All 30+ supported banks (traditional and digital)
- Input and output format specifications
- Use cases (personal finance, accounting, tax prep, etc.)
- All 4 pricing plans with detailed features
- Security, privacy, and compliance information
- Integration capabilities
- Getting started guide
- Company background (TaxFormed)

**When to use**: This is your primary knowledge base - upload this first!

### 2. chatbase-training-faq.md
**Purpose**: Comprehensive Q&A database

**Contains**:
- 50+ frequently asked questions with detailed answers
- Organized by category:
  - General questions
  - Technical questions
  - Pricing & plans
  - Security & privacy
  - Accounting software compatibility
  - Troubleshooting
  - Support information
- Objection handling (price concerns, security, competitors)
- Company/TaxFormed questions

**When to use**: Essential for handling customer questions accurately

### 3. chatbase-training-conversation-guide.md
**Purpose**: Chatbot personality, tone, and conversation structure

**Contains**:
- Brand voice definition (Junto personality)
- Tone guidelines (what to do, what NOT to do)
- Conversation structure templates
- Opening greetings and conversation starters
- How to handle objections professionally
- Escalation triggers (when to connect with humans)
- Response templates for common scenarios
- Example conversations
- Closing conversation scripts

**When to use**: Ensures your chatbot sounds professional and on-brand

### 4. chatbase-training-technical-specs.md
**Purpose**: Deep technical knowledge and troubleshooting

**Contains**:
- Bank-by-bank detailed specifications
- Processing specifications (file sizes, times, accuracy)
- Export format technical details (CSV, Excel, QIF, QBO, JSON)
- Known limitations and edge cases
- Troubleshooting decision trees
- API documentation overview
- Plan recommendation guidance
- User persona recommendations

**When to use**: For handling technical questions and troubleshooting

## How to Upload to Chatbase

### Step 1: Create Chatbase Account
1. Go to https://www.chatbase.co/
2. Sign up for an account
3. Choose your plan (Pro recommended for best AI performance)

### Step 2: Create New Chatbot
1. Click "New Chatbot"
2. Name it: "Junto - ConvertBank-Statement Support"
3. Choose "Custom" chatbot type

### Step 3: Upload Training Documents

**Option A: Upload Files Directly**
1. In Chatbase dashboard → Data Sources
2. Click "Upload Files"
3. Select all 4 .md files from this folder
4. Click "Upload"
5. Wait for processing (may take 5-10 minutes)

**Option B: Copy-Paste Content** (If file upload has issues)
1. Open each .md file in a text editor
2. Copy the entire content
3. In Chatbase → Data Sources → "Add Text"
4. Paste content
5. Give it a title (e.g., "Main Service Overview")
6. Repeat for all 4 documents

### Step 4: Configure Chatbot Settings

**Personality Settings:**
- **Name**: Junto
- **Role**: Customer Support AI for ConvertBank-Statement.com (powered by TaxFormed)
- **Tone**: Professional but friendly, helpful, solution-focused
- **Instructions**:
  ```
  You are Junto, the AI assistant for ConvertBank-Statement.com. You help users understand our bank statement conversion service, answer questions about pricing and features, troubleshoot issues, and guide users toward the right solution. Be professional but friendly, empathetic to user frustrations, and always provide clear next steps. Use British English. When you don't know something or encounter a complex issue, escalate to human support gracefully.
  ```

**Conversation Settings:**
- **Initial Message**: "Hey, I'm Junto, how can I help you today?"
- **Suggested Questions** (add these as quick-start buttons):
  - "How does this work?"
  - "Which banks do you support?"
  - "What are your prices?"
  - "Is my data secure?"

**Model Settings:**
- Use GPT-4 for best quality (GPT-3.5 acceptable for budget)
- Temperature: 0.7 (balanced between creative and accurate)
- Max tokens: 500-800 (prevents overly long responses)

**Visibility Settings:**
- Add to website (Chatbase provides embed code)
- Optional: Enable standalone link for testing

### Step 5: Test Your Chatbot

Test with these questions to verify training:

1. **General**: "What is ConvertBank-Statement?"
2. **Banks**: "Do you support Monzo?"
3. **Pricing**: "How much does it cost?"
4. **Technical**: "What formats can I export to?"
5. **Security**: "Is my financial data safe?"
6. **Objection**: "This seems expensive"
7. **Troubleshooting**: "My file won't upload"
8. **Software**: "Does this work with QuickBooks?"

Expected behavior:
- Accurate, helpful answers
- Professional but friendly tone
- Offers next steps
- Gracefully escalates when needed

### Step 6: Embed on Website

1. In Chatbase → Settings → Embed
2. Copy the embed code
3. Add to your website:
   - **Next.js**: Add to `layout.tsx` or create a `<ChatbaseWidget>` component
   - **Position**: Bottom right corner
   - **Color**: Match your brand (#1E40AF blue)
4. Test on live site

### Step 7: Monitor & Improve

**First Week:**
- Check all conversations daily
- Look for:
  - Inaccurate answers
  - Tone issues
  - Missing information
  - Unnecessary escalations
- Add missing Q&As to training docs

**Ongoing:**
- Review weekly conversation analytics
- Add new FAQs based on common questions
- Update pricing/features when they change
- Refine personality based on user feedback

## Tips for Best Results

### ✅ DO:
- Upload all 4 documents for comprehensive coverage
- Use GPT-4 model for best accuracy
- Test thoroughly before going live
- Monitor conversations and improve training
- Keep documents updated when service changes
- Set clear escalation rules

### ❌ DON'T:
- Skip the conversation guide (personality matters!)
- Use only one document (coverage will be incomplete)
- Set temperature too high (creates inconsistent answers)
- Forget to update when pricing/features change
- Ignore negative feedback in conversations

## Updating Training Data

**When to update:**
- New pricing plans added
- New banks supported
- Features added/changed
- Common questions emerge
- Service policies change

**How to update:**
1. Edit the relevant .md file
2. Re-upload to Chatbase (overwrites old version)
3. Test updated knowledge
4. Monitor first 10-20 conversations after update

## Advanced Customization

### Lead Capture
Set up Chatbase to collect emails when:
- User asks for demo
- User expresses strong interest
- User wants to be contacted

### Custom Actions
Configure actions for:
- "Try Free Plan" → Link to signup
- "View Pricing" → Link to pricing page
- "Book Demo" → Link to calendar
- "Contact Support" → Escalate to human

### A/B Testing
Test different:
- Opening messages
- Suggested questions
- Personality tones
- Escalation thresholds

## Troubleshooting Chatbase Setup

**Problem: Chatbot gives wrong answers**
- Solution: Check which document contains correct info, re-upload
- Verify model is using all uploaded documents
- Check document processing status (should be "Completed")

**Problem: Chatbot is too formal/casual**
- Solution: Adjust personality instructions and review conversation guide
- Check temperature setting (lower = more consistent)

**Problem: Chatbot doesn't know about new features**
- Solution: Update relevant .md file and re-upload
- May take 5-10 minutes to process

**Problem: Too many escalations**
- Solution: Add more examples to FAQ and troubleshooting sections
- Review actual conversations to identify gaps

## Support

**Chatbase Issues:**
- Chatbase Help Center: https://help.chatbase.co/
- Email: support@chatbase.co

**Document Questions:**
- These documents were created for your ConvertBank-Statement.com service
- Customize any details that don't match your actual offering
- Add/remove sections based on your needs

## Files Summary

```
chatbase-training/
├── README.md (this file)
├── chatbase-training-main-service.md (15KB - Core service info)
├── chatbase-training-faq.md (35KB - 50+ Q&As)
├── chatbase-training-conversation-guide.md (25KB - Tone & personality)
└── chatbase-training-technical-specs.md (30KB - Technical details)
```

**Total Knowledge Base**: ~105KB of comprehensive training data

---

## Quick Start Checklist

- [ ] Create Chatbase account
- [ ] Create new chatbot named "Junto"
- [ ] Upload all 4 .md files
- [ ] Configure personality settings
- [ ] Set initial message: "Hey, I'm Junto, how can I help you today?"
- [ ] Add suggested questions
- [ ] Test with sample questions
- [ ] Embed on website
- [ ] Monitor first 50 conversations
- [ ] Adjust based on feedback

---

**Ready to launch your AI chatbot!** 🚀

All documents are optimized for Chatbase's AI training. Simply upload and your chatbot will be ready to help customers 24/7 with accurate, professional, on-brand support.
