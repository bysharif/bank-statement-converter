# Chatbase Chatbot Setup Guide

## Quick Setup Checklist

- [ ] Create Chatbase account
- [ ] Upload all 4 training documents
- [ ] Configure base instructions
- [ ] Get your Chatbot ID
- [ ] Update ChatbaseWidget.tsx with your ID
- [ ] Test locally
- [ ] Deploy to production

---

## Step 1: Create & Configure Chatbase Chatbot

### 1.1 Create Account & Chatbot
1. Go to https://www.chatbase.co/
2. Sign up (choose Pro plan for best performance)
3. Click "New Chatbot"
4. Name: **Junto - ConvertBank-Statement Support**

### 1.2 Upload Training Documents
1. In dashboard → Data Sources → Upload Files
2. Upload ALL 4 documents from `/chatbase-training/`:
   - `chatbase-training-main-service.md`
   - `chatbase-training-faq.md`
   - `chatbase-training-conversation-guide.md`
   - `chatbase-training-technical-specs.md`
3. Wait for processing (5-10 minutes)

### 1.3 Configure Base Instructions
1. Go to Settings → Instructions
2. Copy and paste the base instructions provided
3. Save

### 1.4 Customize Appearance
In Settings → Appearance:
- **Chat Bubble Color**: `#1E40AF` (your brand blue)
- **Position**: Bottom right
- **Display Name**: Junto
- **Initial Message**: "Hey, I'm Junto, how can I help you today?"
- **Suggested Messages** (add these):
  - "How does this work?"
  - "Which banks do you support?"
  - "What are your prices?"
  - "Is my data secure?"

### 1.5 Configure Model Settings
In Settings → Model:
- **Model**: GPT-4 (recommended) or GPT-3.5 (budget option)
- **Temperature**: 0.7
- **Max Tokens**: 500-800

---

## Step 2: Install on Your Website

### 2.1 Get Your Chatbot ID
1. In Chatbase dashboard → Settings → Embed
2. Look for your **Chatbot ID** in the embed code
3. It looks like: `chatbotId="abc123xyz456"`
4. Copy the ID (just the part between quotes)

### 2.2 Update ChatbaseWidget Component
Open `/src/components/ChatbaseWidget.tsx` and replace **both** instances of `"YOUR_CHATBOT_ID_HERE"` with your actual Chatbot ID:

```typescript
window.embeddedChatbotConfig = {
  chatbotId: "abc123xyz456", // ← Replace this
  domain: "www.chatbase.co"
}

script.setAttribute('chatbotId', "abc123xyz456") // ← And this
```

### 2.3 The Component is Already Integrated!
✅ ChatbaseWidget is already added to your root layout (`src/app/layout.tsx`)
✅ It will appear on ALL pages automatically
✅ Old Junto chat has been removed from CTA section

---

## Step 3: Test Locally

### 3.1 Run Development Server
```bash
npm run dev
```

### 3.2 Test the Chatbot
1. Open http://localhost:3000
2. Look for chat bubble in bottom-right corner
3. Click to open chat
4. Test with these questions:
   - "How much does it cost?"
   - "Do you support Monzo?"
   - "What formats can I export to?"
   - "Is my data safe?"
5. Verify responses are accurate and on-brand

### 3.3 Check All Pages
Test that chatbot appears on:
- Homepage
- Pricing page
- Any other pages you have

---

## Step 4: Deploy to Production

### 4.1 Commit Changes
```bash
git add .
git commit -m "Add Chatbase AI chatbot integration"
git push
```

### 4.2 Deploy to Vercel
```bash
vercel --prod
```

### 4.3 Test on Live Site
1. Go to https://convertbank-statement.com
2. Verify chatbot loads
3. Test a few questions
4. Check it works on all pages

---

## Step 5: Monitor & Improve

### 5.1 First Week Monitoring
In Chatbase dashboard → Conversations:
- Review all conversations daily
- Look for:
  - ❌ Inaccurate answers
  - ❌ Tone issues
  - ❌ Missing information
  - ❌ Unnecessary escalations
- Fix by updating training documents

### 5.2 Analytics to Track
- Total conversations
- Average response time
- User satisfaction ratings
- Most common questions
- Escalation rate

### 5.3 Ongoing Improvements
**Weekly:**
- Review conversation analytics
- Add new FAQs based on common questions
- Refine unclear responses

**When updating service:**
- New pricing → Update `chatbase-training-main-service.md`
- New banks → Update `chatbase-training-main-service.md` and `chatbase-training-technical-specs.md`
- New features → Update relevant training docs
- Re-upload updated documents to Chatbase

---

## Troubleshooting

### Chatbot doesn't appear
**Check:**
1. Did you replace `YOUR_CHATBOT_ID_HERE` in ChatbaseWidget.tsx?
2. Is your Chatbot ID correct?
3. Check browser console for errors
4. Try incognito mode (clear cache)

**Fix:**
- Verify Chatbot ID in Chatbase dashboard
- Check ChatbaseWidget.tsx has correct ID
- Clear browser cache and hard refresh (Cmd+Shift+R)

### Chatbot gives wrong answers
**Check:**
1. Are all 4 training documents uploaded?
2. Check document processing status (should be "Completed")
3. Review which document contains the correct info

**Fix:**
- Re-upload the relevant training document
- Wait 5-10 minutes for reprocessing
- Test again

### Chatbot is too formal/casual
**Check:**
- Review conversation guide settings
- Check temperature (should be 0.7)

**Fix:**
- Adjust base instructions to emphasize tone
- Lower temperature for more consistent responses
- Add more tone examples to conversation guide

### Too many escalations
**Check:**
- Review actual conversations to identify gaps
- Check if information is in training docs

**Fix:**
- Add missing Q&As to FAQ document
- Expand troubleshooting sections
- Add more examples to technical specs

---

## Advanced Configuration

### Lead Capture
Enable in Chatbase Settings → Leads:
- Capture emails when users ask for demo
- Capture emails when users express interest
- Export leads to your CRM

### Custom Actions (if available in your plan)
Configure in Settings → Actions:
- **Start Free Trial** → https://convertbank-statement.com/upload
- **View Pricing** → https://convertbank-statement.com/pricing
- **Book Demo** → https://convertbank-statement.com/demo

### A/B Testing
Test different:
- Opening messages
- Suggested questions
- Personality tones
- Escalation thresholds

### White Labeling (Pro/Business plans)
- Custom domain: chat.convertbank-statement.com
- Remove "Powered by Chatbase" branding
- Custom colors matching your brand

---

## File Structure

Your chatbot files are organized as follows:

```
bankstatementconverter/
├── src/
│   ├── app/
│   │   └── layout.tsx (ChatbaseWidget added here)
│   └── components/
│       ├── ChatbaseWidget.tsx (Main chatbot integration)
│       └── landing/
│           └── cta-section.tsx (Cleaned up, old chat removed)
├── chatbase-training/ (Training documents folder)
│   ├── README.md
│   ├── chatbase-training-main-service.md
│   ├── chatbase-training-faq.md
│   ├── chatbase-training-conversation-guide.md
│   └── chatbase-training-technical-specs.md
└── CHATBASE_SETUP_GUIDE.md (This file)
```

---

## Support

**Chatbase Issues:**
- Help Center: https://help.chatbase.co/
- Email: support@chatbase.co

**Training Document Updates:**
- Edit files in `/chatbase-training/` folder
- Re-upload to Chatbase
- Wait for processing

---

## Quick Reference

**Your Chatbot Configuration:**
- **Name**: Junto
- **Brand**: ConvertBank-Statement.com (powered by TaxFormed)
- **Tone**: Professional but friendly
- **Initial Message**: "Hey, I'm Junto, how can I help you today?"
- **Color**: #1E40AF (brand blue)
- **Position**: Bottom right

**Training Data:**
- Main service info: 15KB
- FAQ (50+ Q&As): 35KB
- Conversation guide: 25KB
- Technical specs: 30KB
- **Total**: ~105KB comprehensive knowledge base

---

## Success Metrics

Track these after launch:
- ✅ Chatbot loads on all pages
- ✅ Response accuracy > 90%
- ✅ Average response time < 3 seconds
- ✅ User satisfaction > 4/5 stars
- ✅ Escalation rate < 20%
- ✅ Conversation completion rate > 70%

---

**You're all set!** 🎉

Once you add your Chatbot ID to ChatbaseWidget.tsx and deploy, your AI chatbot will be live 24/7 helping customers!
