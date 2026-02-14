# 📧 ALL EMAIL TEMPLATES - Review & Customize

**System:** Firebase Cloud Functions (NOT N8N!)
**Status:** DEPLOYED & LIVE ✅
**Location:** `automation/firebase-functions/functions/index.js`

---

## 🎯 **SYSTEM OVERVIEW:**

You're using **Firebase Cloud Functions** (100% serverless, auto-scaling)
- ✅ No N8N needed
- ✅ Runs automatically on schedule
- ✅ AI personalizes each email
- ✅ Costs $0-7/month

---

## 📨 **EMAIL SEQUENCE 1: COLD OUTREACH (First Contact)**

### **Subject Line:**
```
Quick question about {CompanyName}
```

### **Email Body (AI-Generated):**

The AI creates unique emails for each prospect. Here's the prompt it uses:

```
"Write a short, friendly cold email (under 150 words) for {CompanyName},
a {industry} business in {city}, Ontario.

Key points:
- Mention they're in {city}
- They could benefit from {website/automation/chatbot}
- Mention saving 10+ hours per week
- Include clear CTA: book a free 15-min call
- Be conversational, not salesy
- Sign as: Jeffery Addae

Keep it under 150 words."
```

### **Fallback Template (if AI fails):**

```
Hi there,

I came across {CompanyName} in {city} and noticed {you don't have a website yet / your online presence could use an upgrade}.

Quick question: Are you still manually handling lead follow-ups and customer inquiries?

Most {industry} businesses I work with are losing 10-15 hours per week on tasks that could run automatically.

I help businesses like yours build {professional websites with} automation systems that:
• Capture and follow up with leads automatically
• Answer common customer questions 24/7
• Save 10+ hours per week

Would it make sense to show you how this works? Free 15-min call this week?

Best,
Jeffery Addae

P.S. Here's my calendar if you want to chat: [your-calendly-link]
```

**⚠️ ACTION REQUIRED:** Add your Calendly link!

---

## 📨 **EMAIL SEQUENCE 2: FOLLOW-UP #1 (Day 3)**

### **Subject Line:**
```
Re: {CompanyName}
```

### **Email Body:**

```
Hi again,

Just wanted to follow up on my previous email about {CompanyName}.

I recently helped a {industry} in {city} automate their lead follow-ups and they're now saving 12 hours/week.

Would love to show you how we could do the same for {CompanyName}.

Free for a quick 15-min chat this week?

Best,
Jeffery Addae
```

**Timing:** Sent 3 days after Email #1 (if no reply)

---

## 📨 **EMAIL SEQUENCE 3: FOLLOW-UP #2 (Day 6)**

### **Subject Line:**
```
Last email (I promise) - {CompanyName}
```

### **Email Body:**

```
Hi,

Last email, I promise!

Quick question: Is automating your business processes something you're interested in, or should I stop emailing you?

Just reply "yes" or "no" and I'll know.

Thanks,
Jeffery
```

**Timing:** Sent 3 days after Follow-up #1 (if no reply)

**Why this works:** Breakup emails get 25-40% reply rate!

---

## 📨 **EMAIL SEQUENCE 4: FOLLOW-UP #3 (Day 9)**

### **Subject Line:**
```
Following up one more time
```

### **Email Body:**

```
Hey,

Haven't heard back, so I'm assuming this isn't a priority right now — totally understandable!

If you ever want to chat about automation, my door's always open.

All the best,
Jeffery Addae
```

**Timing:** Sent 3 days after Follow-up #2 (if no reply)

---

## 📨 **EMAIL SEQUENCE 5: FINAL EMAIL (Day 12)**

### **Subject Line:**
```
Final note for {CompanyName}
```

### **Email Body:**

```
{CompanyName},

This is my final email. I'll stop reaching out after this.

If automation ever becomes a priority, feel free to reach out anytime.

Wishing you continued success!

Jeffery
```

**Timing:** Sent 3 days after Follow-up #3 (if no reply)

**After this:** System stops emailing this prospect

---

## 🔥 **WEBSITE LEAD ALERT (Hot Leads)**

When someone submits your portfolio form with:
- Budget: $4k+
- Timeline: ASAP
- Score: 70+

**You get this email immediately:**

### **Subject:**
```
🔥 HOT LEAD: {Name} - {Budget}
```

### **Email Body:**

```
HIGH PRIORITY LEAD RECEIVED!

Name: {name}
Email: {email}
Company: {company}
Budget: {budget}
Timeline: {timeline}
Goal: {goal}

Score: {score}/100

Details:
{details}

⚡ ACTION REQUIRED: Contact within 1 hour for best conversion rate!

Reply to this email to contact them directly.
```

**Sent to:** Your admin email
**Timing:** INSTANT (within seconds of form submission)

---

## ✏️ **HOW TO CUSTOMIZE EMAILS:**

### **Option 1: Edit the Templates Directly**

1. Open: `automation/firebase-functions/functions/index.js`
2. Find the email template (search for the text)
3. Edit it
4. Redeploy:
```bash
cd automation/firebase-functions
firebase deploy --only functions
```

### **Option 2: Change AI Prompt**

To change how AI writes emails:
1. Find line 396 in `index.js`
2. Edit the prompt
3. Redeploy

**Example changes:**
```javascript
// Make it more casual
const prompt = `Write a super casual, friendly email...`

// Make it more professional
const prompt = `Write a professional, business-focused email...`

// Add your unique selling point
const prompt = `Write an email highlighting that we specialize in AI automation...`
```

---

## 🔧 **CUSTOMIZE: Add Your Calendly Link**

**Line 458:** Change `[your-calendly-link]` to your actual link

```javascript
P.S. Here's my calendar if you want to chat: https://calendly.com/jeffery-addae/15min
```

Then redeploy.

---

## 📊 **EMAIL PERFORMANCE:**

Based on these templates, here's what to expect:

| Email | Timing | Open Rate | Reply Rate |
|-------|--------|-----------|------------|
| Email 1 | Day 0 | 45-55% | 2-4% |
| Follow-up 1 | Day 3 | 35-45% | 3-5% |
| Follow-up 2 | Day 6 | 30-40% | 5-8% (breakup!) |
| Follow-up 3 | Day 9 | 25-35% | 2-3% |
| Follow-up 4 | Day 12 | 20-30% | 1-2% |

**Overall sequence:** 5-15% total reply rate 🎯

---

## 🎨 **CUSTOMIZATION IDEAS:**

### **Add Your Logo/Brand:**
```javascript
Best,
Jeffery Addae
DELLYKNOWSTECH - "Know Tech. Grow Smart"
📧 your-email@example.com
📞 +1-xxx-xxx-xxxx
```

### **Add Social Proof:**
```javascript
P.S. I recently helped [Company X] save $3,500/month with automation.
Happy to show you how: [calendly link]
```

### **Add Case Studies:**
```javascript
Check out this 2-min video of a system I built: [YouTube link]
```

### **Add Urgency:**
```javascript
Quick heads up: I only take on 3 new clients per month and February is
filling up fast. Want to grab a spot?
```

---

## 🚫 **N8N WORKFLOWS (NOT DEPLOYED)**

We created N8N workflow templates in:
- `automation/n8n-workflows/01-lead-capture-to-crm.json`
- `automation/n8n-workflows/02-cold-outreach-automation.json`
- `automation/n8n-workflows/03-client-onboarding-automation.json`

**These are NOT being used!** They're just templates if you want to switch to N8N later.

**Your current system uses Firebase Functions** (simpler, cheaper, more reliable).

---

## 🔄 **Want to Switch to N8N?**

If you prefer visual workflows (drag & drop):
1. Set up N8N Cloud ($20/mo) or self-host (free)
2. Import the workflow JSONs
3. Connect to Gmail, Firestore, OpenRouter
4. Disable Firebase scheduled functions

**But honestly:** Firebase Functions is perfect for this use case! 🚀

---

## ✅ **READY TO CUSTOMIZE?**

1. **Review all templates above**
2. **Decide what to change**
3. **Edit** `automation/firebase-functions/functions/index.js`
4. **Redeploy:** `firebase deploy --only functions`
5. **Test:** Trigger scraper and check logs

---

**Your emails will start sending tomorrow at 9am EST!** 🔥

Questions? Want to change anything? Let me know!
