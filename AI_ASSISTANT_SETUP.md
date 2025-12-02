# 🤖 AI Portfolio Assistant - Complete Setup Guide

Your portfolio now has a **comprehensive AI assistant** with real-time portfolio analysis powered by **Vercel AI Gateway** or **OpenRouter**.

## ✨ Features

### 🎯 Core Capabilities
- ✅ Real-time AI-powered responses about your portfolio
- ✅ Conversation history and context awareness
- ✅ Professional insights about skills, projects, and experience
- ✅ Intelligent routing for hiring/collaboration inquiries

### 💎 Premium UI/UX
- ✅ Beautiful animated floating chat button with sparkle effect
- ✅ Smooth animations and transitions
- ✅ Mobile-responsive design
- ✅ Dark mode support
- ✅ Suggested questions for quick interactions
- ✅ Typing indicators and loading states

### 🛠️ Advanced Features
- ✅ **Copy to clipboard** - Copy any AI response
- ✅ **Export chat** - Download conversation as text file
- ✅ **Reset conversation** - Start fresh anytime
- ✅ **Conversation memory** - AI remembers last 3 exchanges
- ✅ **Auto-focus input** - Instant typing when opened
- ✅ **Keyboard shortcuts** - Press Enter to send

---

## 🚀 Quick Start (3 Options)

### Option 1: Vercel AI Gateway (Recommended for Production)

**Best for:** Production apps with analytics, rate limiting, and monitoring

1. **Set up Vercel AI Gateway:**
   - Go to https://vercel.com/docs/ai-gateway
   - Create a new AI Gateway
   - Configure your provider (OpenAI, Anthropic, etc.)
   - Copy your gateway URL

2. **Add to `.env`:**
   ```bash
   VERCEL_AI_GATEWAY_URL=https://gateway.ai.cloudflare.com/v1/{account_id}/{gateway_slug}/openai
   VERCEL_AI_GATEWAY_KEY=your-vercel-gateway-key-here
   AI_MODEL=gpt-4o-mini
   APP_URL=http://localhost:3000
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

### Option 2: OpenRouter (Free Tier) ⭐ Easiest

**Best for:** Development, testing, and low-traffic sites

1. **Get FREE API key:**
   - Go to https://openrouter.ai/keys
   - Sign up (no credit card required)
   - Create API key
   - Copy key (starts with `sk-or-v1-...`)

2. **Add to `.env`:**
   ```bash
   OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AI_MODEL=google/gemma-7b-it:free
   APP_URL=http://localhost:3000
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

### Option 3: Direct OpenAI (Paid)

**Best for:** Maximum quality and reliability (costs per request)

1. **Get OpenAI API key:**
   - Go to https://platform.openai.com/api-keys
   - Create new key
   - Copy key

2. **Add to `.env`:**
   ```bash
   OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   AI_MODEL=gpt-4o-mini
   APP_URL=http://localhost:3000
   ```

3. **Restart server:**
   ```bash
   npm run dev
   ```

---

## 🧪 Testing

1. Open http://localhost:3000
2. Click the floating chat button (bottom-right, sparkle icon)
3. Try these questions:
   - "What are Jeffery's core technical skills?"
   - "Tell me about his recent projects"
   - "What services does he offer?"
   - "How can I hire him?"
   - "What's his experience with React?"

---

## 📁 What Was Created

### 1. **AIPortfolioAssistant.tsx** (Frontend Component)
**Location:** `client/src/components/AIPortfolioAssistant.tsx`

**Features:**
- Floating animated chat button
- Full chat UI with message history
- Suggested questions
- Copy/export/reset functionality
- Conversation history management
- Auto-scroll and auto-focus
- Loading states and error handling

### 2. **Enhanced `/api/chat` Route** (Backend)
**Location:** `server/routes.ts` (lines 68-186)

**Features:**
- Comprehensive system prompt with portfolio details
- Conversation history support (last 3 exchanges)
- Multi-provider support (Vercel/OpenRouter/OpenAI)
- Configurable AI models
- Error handling and fallbacks
- Response streaming preparation

### 3. **Updated Environment Variables**
**Location:** `.env`

**New variables:**
```bash
VERCEL_AI_GATEWAY_URL=
VERCEL_AI_GATEWAY_KEY=
OPENROUTER_API_KEY=
OPENAI_API_KEY=
AI_MODEL=google/gemma-7b-it:free
APP_URL=http://localhost:3000
```

---

## ⚙️ Configuration

### Change AI Model

Edit `.env`:

```bash
# Free models (OpenRouter)
AI_MODEL=google/gemma-7b-it:free
AI_MODEL=meta-llama/llama-3-8b-instruct:free
AI_MODEL=mistralai/mistral-7b-instruct:free

# Paid models (OpenAI via Vercel Gateway or direct)
AI_MODEL=gpt-4o-mini
AI_MODEL=gpt-4o
AI_MODEL=gpt-3.5-turbo
```

### Customize System Prompt

Edit `server/routes.ts` lines 77-128 to customize how the AI describes your portfolio.

### Adjust UI/Colors

Edit `client/src/components/AIPortfolioAssistant.tsx`:
- Line 165: Button gradient color
- Line 190: Header gradient color
- Line 238-242: Message bubble colors
- Line 187: Chat window size

### Modify Suggested Questions

Edit `client/src/components/AIPortfolioAssistant.tsx` lines 12-19:

```ts
const SUGGESTED_QUESTIONS = [
  "Your custom question 1",
  "Your custom question 2",
  // ...
];
```

---

## 🌍 Deployment to Vercel

### 1. Set Environment Variables

In Vercel dashboard → Settings → Environment Variables, add:

```bash
# Choose ONE of these provider options:

# Option A: Vercel AI Gateway
VERCEL_AI_GATEWAY_URL=your-gateway-url
VERCEL_AI_GATEWAY_KEY=your-gateway-key
AI_MODEL=gpt-4o-mini

# Option B: OpenRouter (free)
OPENROUTER_API_KEY=sk-or-v1-...
AI_MODEL=google/gemma-7b-it:free

# Option C: Direct OpenAI
OPENAI_API_KEY=sk-...
AI_MODEL=gpt-4o-mini

# Always set this:
APP_URL=https://your-domain.vercel.app
```

### 2. Deploy

```bash
git add .
git commit -m "Add AI assistant"
git push
```

Vercel will auto-deploy.

---

## 🔧 Troubleshooting

### "Chat service temporarily unavailable"

**Cause:** API key not configured or invalid

**Fix:**
1. Check `.env` has valid API key
2. Restart server: `npm run dev`
3. Check server logs for errors

### API Key Not Working

**OpenRouter:**
- Key should start with `sk-or-v1-`
- Check usage limits at https://openrouter.ai/usage

**OpenAI:**
- Key should start with `sk-proj-` or `sk-`
- Check usage at https://platform.openai.com/usage

**Vercel Gateway:**
- Verify gateway URL format
- Check gateway is active in Vercel dashboard

### 404 Error on `/api/chat`

1. Make sure server is running: `npm run dev`
2. Check `server/routes.ts` contains the `/api/chat` route (line 68+)
3. Clear browser cache and reload

### Slow Responses

**Free models** (OpenRouter): 2-5 seconds normal  
**Paid models** (OpenAI): 1-2 seconds normal

To improve:
1. Upgrade to faster model (`gpt-4o-mini`)
2. Reduce `max_tokens` in `server/routes.ts` line 159
3. Use Vercel AI Gateway for caching

### Messages Not Saving History

The assistant remembers the last 3 exchanges (6 messages). This is intentional to:
- Keep context relevant
- Reduce API costs
- Maintain fast responses

To change: Edit `client/src/components/AIPortfolioAssistant.tsx` line 66:

```ts
.slice(-6)  // Change -6 to -10 for 5 exchanges, etc.
```

---

## 💰 Pricing & Limits

### OpenRouter Free Tier
- ✅ **Cost:** $0
- ✅ **Models:** gemma-7b, llama-3-8b, mistral-7b
- ⚠️ **Limits:** Reasonable rate limits for development
- 📊 **Best for:** Development, testing, personal sites

### OpenAI (Paid)
- 💳 **gpt-4o-mini:** ~$0.0001/request
- 💳 **gpt-3.5-turbo:** ~$0.0005/request
- 💳 **gpt-4o:** ~$0.003/request
- 📊 **Best for:** Production apps with budget

### Vercel AI Gateway
- ✅ **Cost:** Free tier available
- ✅ **Features:** Analytics, caching, rate limiting, monitoring
- ✅ **Supports:** All major providers (OpenAI, Anthropic, etc.)
- 📊 **Best for:** Production apps needing observability

---

## 🎨 UI Components Used

- **framer-motion** - Animations
- **lucide-react** - Icons (MessageCircle, Send, X, Sparkles, etc.)
- **Tailwind CSS** - Styling
- **shadcn/ui** - Design system base

All already installed in your project! ✅

---

## 📊 API Flow

```
User types message
     ↓
Frontend (AIPortfolioAssistant.tsx)
     ↓
POST /api/chat with { message, conversationHistory }
     ↓
Backend (server/routes.ts)
     ↓
Vercel AI Gateway OR OpenRouter OR OpenAI
     ↓
AI Model generates response
     ↓
Backend returns { response, conversationId }
     ↓
Frontend displays AI message
```

---

## 🔐 Security Best Practices

1. ✅ **Never commit `.env`** - Already in `.gitignore`
2. ✅ **Use environment variables** - API keys in env vars, not code
3. ✅ **Add rate limiting** - Prevent abuse (see next section)
4. ✅ **Validate input** - Already done in `/api/chat` route
5. ✅ **Error handling** - Already implemented with fallbacks

### Optional: Add Rate Limiting

Install:
```bash
npm install express-rate-limit
```

Add to `server/routes.ts`:
```ts
import rateLimit from 'express-rate-limit';

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window
  message: 'Too many requests, please try again later.'
});

app.post("/api/chat", chatLimiter, async (req, res) => {
  // ... existing code
});
```

---

## 🎯 Next Steps

1. ✅ **Get API key** (OpenRouter for free, or Vercel Gateway)
2. ✅ **Add to `.env`**
3. ✅ **Restart server** (`npm run dev`)
4. ✅ **Test the assistant** (open chat, ask questions)
5. ✅ **Customize system prompt** (edit `server/routes.ts`)
6. ✅ **Adjust UI colors** (edit `AIPortfolioAssistant.tsx`)
7. ✅ **Deploy to Vercel** (add env vars, push to git)

---

## 📚 Resources

- **Vercel AI Gateway:** https://vercel.com/docs/ai-gateway
- **OpenRouter:** https://openrouter.ai/docs
- **OpenAI API:** https://platform.openai.com/docs
- **Framer Motion:** https://www.framer.com/motion/
- **Lucide Icons:** https://lucide.dev/

---

## 🆘 Support

If you encounter issues:

1. Check server logs: Look for error messages
2. Test API key: Use Postman/curl to test `/api/chat` directly
3. Review `.env`: Ensure all variables are set correctly
4. Check network tab: See if `/api/chat` returns 200 or error

Example direct API test:
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are Jeffery'\''s skills?"}'
```

---

**Enjoy your AI-powered portfolio! 🚀✨**

The assistant is now ready to provide intelligent, context-aware responses about your skills, projects, and professional experience. Visitors can interact naturally and get instant answers about your work!
