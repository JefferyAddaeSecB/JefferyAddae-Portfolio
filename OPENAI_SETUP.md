# 🤖 AI Portfolio Assistant - OpenAI Setup

Your portfolio now has a comprehensive AI assistant powered by **OpenAI**.

## 🚀 Quick Setup (3 Steps)

### Step 1: Get Your OpenAI API Key

1. Go to **https://platform.openai.com/signup**
2. Create an account (or sign in)
3. Go to **https://platform.openai.com/api-keys**
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-proj-...` or `sk-...`)

💡 **Note:** You'll need to add a payment method, but OpenAI gives you $5 in free credits to start!

### Step 2: Add API Key to `.env`

Open `.env` in your project root and replace:

```bash
OPENAI_API_KEY=your-openai-api-key-here
```

With your actual key:

```bash
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Server

```bash
npm run dev
```

## ✅ Test It

1. Open **http://localhost:3000**
2. Click the **floating chat button** (bottom-right, sparkle icon)
3. Ask questions like:
   - "What are Jeffery's core technical skills?"
   - "Tell me about his projects"
   - "What services does he offer?"
   - "How can I hire him?"

The AI will respond with intelligent answers about your portfolio!

---

## ✨ Features

### Core Capabilities
- ✅ Real-time AI-powered responses
- ✅ Conversation history (remembers last 3 exchanges)
- ✅ Professional portfolio analysis
- ✅ Hiring/collaboration inquiry routing

### UI/UX
- ✅ Animated floating button with sparkle effect
- ✅ Beautiful chat interface
- ✅ Suggested questions
- ✅ Copy, export, and reset functions
- ✅ Mobile-responsive
- ✅ Dark mode support

---

## ⚙️ Configuration

### Change AI Model

Edit `.env`:

```bash
# Fast and affordable (recommended)
AI_MODEL=gpt-4o-mini

# Most capable (more expensive)
AI_MODEL=gpt-4o

# Older, cheaper option
AI_MODEL=gpt-3.5-turbo

# Latest turbo model
AI_MODEL=gpt-4-turbo
```

**Recommendation:** Use `gpt-4o-mini` for the best balance of speed, quality, and cost.

### Customize Responses

Edit `server/routes.ts` lines 77-128 to customize the system prompt with your specific portfolio details.

### Adjust UI Colors

Edit `client/src/components/AIPortfolioAssistant.tsx`:
- **Line 165:** Button gradient color
- **Line 190:** Header gradient color
- **Line 238-242:** Message bubble colors

---

## 💰 Pricing

### OpenAI Costs (as of 2024)

**gpt-4o-mini** (Recommended):
- Input: ~$0.15 per 1M tokens
- Output: ~$0.60 per 1M tokens
- **~$0.0001 per chat message** (very affordable)

**gpt-3.5-turbo:**
- Input: ~$0.50 per 1M tokens
- Output: ~$1.50 per 1M tokens

**gpt-4o:**
- Input: ~$5 per 1M tokens
- Output: ~$15 per 1M tokens

### Estimated Costs

For a portfolio site:
- **100 messages/day:** ~$0.30/month with gpt-4o-mini
- **1,000 messages/day:** ~$3/month with gpt-4o-mini

💡 **Free Credits:** OpenAI provides $5 in free credits for new accounts.

---

## 🌍 Deployment to Vercel

### 1. Add Environment Variable

In Vercel dashboard → **Settings** → **Environment Variables**:

```
Key: OPENAI_API_KEY
Value: sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Optional:
```
Key: AI_MODEL
Value: gpt-4o-mini
```

### 2. Deploy

```bash
git add .
git commit -m "Add OpenAI assistant"
git push
```

Vercel will auto-deploy with your new env vars.

---

## 🔧 Troubleshooting

### "Chat service temporarily unavailable"

**Cause:** API key not set or invalid

**Fix:**
1. Check `.env` has valid `OPENAI_API_KEY`
2. Verify key starts with `sk-proj-` or `sk-`
3. Restart server: `npm run dev`
4. Check server console for errors

### "API key not configured"

**Fix:**
1. Make sure you saved `.env` after editing
2. Restart the development server
3. Key must be on same line as `OPENAI_API_KEY=` (no spaces before key)

### Rate Limit Errors

**Cause:** Too many requests (free tier has limits)

**Fix:**
1. Add payment method to OpenAI account
2. Or wait a few minutes and try again
3. Or add rate limiting (see main docs)

### Billing Issues

**Cause:** No payment method or insufficient credits

**Fix:**
1. Go to https://platform.openai.com/account/billing
2. Add a payment method
3. Set usage limits to control costs

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env`** - Already in `.gitignore`
2. ✅ **Rotate keys periodically** - Generate new keys every few months
3. ✅ **Set usage limits** - In OpenAI dashboard to prevent unexpected charges
4. ✅ **Monitor usage** - Check https://platform.openai.com/usage regularly
5. ✅ **Use environment variables** - Never hardcode API keys in code

---

## 📊 What Was Changed

### 1. Server Route (`server/routes.ts`)
- Changed from Vercel AI Gateway to OpenAI direct API
- URL: `https://api.openai.com/v1/chat/completions`
- Simpler configuration, just needs `OPENAI_API_KEY`

### 2. Environment Variables (`.env`)
- Simplified to just `OPENAI_API_KEY` and `AI_MODEL`
- Removed Vercel Gateway and OpenRouter configs
- Default model: `gpt-4o-mini`

### 3. UI Component (`AIPortfolioAssistant.tsx`)
- Updated header to show "Powered by OpenAI"
- All features remain the same

---

## 📚 Resources

- **OpenAI Platform:** https://platform.openai.com
- **API Documentation:** https://platform.openai.com/docs
- **Pricing:** https://openai.com/pricing
- **Usage Dashboard:** https://platform.openai.com/usage
- **API Keys:** https://platform.openai.com/api-keys

---

## 🎯 Next Steps

1. ✅ Get your OpenAI API key
2. ✅ Add to `.env` file
3. ✅ Restart server
4. ✅ Test the chat assistant
5. ✅ Customize system prompt (optional)
6. ✅ Deploy to Vercel with env var

---

## 💡 Tips

### Reduce Costs
- Use `gpt-4o-mini` instead of `gpt-4o`
- Reduce `max_tokens` in `server/routes.ts` (line 159)
- Set OpenAI usage limits in dashboard

### Improve Responses
- Customize system prompt with more portfolio details
- Increase `temperature` for more creative responses
- Add more conversation history (edit line 66 in component)

### Monitor Usage
- Check OpenAI dashboard daily: https://platform.openai.com/usage
- Set up billing alerts in OpenAI settings
- Enable email notifications for high usage

---

**Your AI assistant is ready! 🚀**

Visitors can now interact with an intelligent assistant that provides real-time insights about your skills, projects, and experience.
