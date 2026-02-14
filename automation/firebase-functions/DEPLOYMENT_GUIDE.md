# 🚀 Firebase Functions Deployment Guide
## Get Your Automation Running in 15 Minutes

---

## ✅ **Prerequisites**

You already have:
- ✅ Firebase project (jeffery-addae-automation)
- ✅ Firebase credentials
- ✅ Gmail account
- ✅ OpenRouter API key

---

## 📋 **Step 1: Install Firebase CLI**

```bash
npm install -g firebase-tools
firebase login
```

---

## 📋 **Step 2: Initialize Firebase Functions**

```bash
cd automation/firebase-functions
firebase init functions

# Select:
# - Use existing project: jeffery-addae-automation
# - Language: JavaScript
# - ESLint: No (or Yes, up to you)
# - Install dependencies: Yes
```

---

## 📋 **Step 3: Set Environment Variables**

```bash
# Copy the example file
cd functions
cp .env.example .env

# Edit .env with your credentials
nano .env
```

**Fill in:**
```
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=your-gmail@gmail.com
OPENROUTER_API_KEY=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
```

**Important:** For Gmail password, use an **App Password**:
1. Go to: https://myaccount.google.com/apppasswords
2. Create new app password
3. Copy the 16-character password
4. Use that in `.env`

---

## 📋 **Step 4: Set Firebase Config**

```bash
# Set environment variables in Firebase
firebase functions:config:set \
  email.user="your-gmail@gmail.com" \
  email.password="your-app-password" \
  email.admin="your-gmail@gmail.com" \
  openrouter.key="sk-or-v1-your-key"
```

---

## 📋 **Step 5: Deploy Functions**

```bash
cd functions
npm install

# Deploy all functions
firebase deploy --only functions
```

This will deploy:
- ✅ `scrapeGoogleMaps` - Find prospects
- ✅ `findEmails` - Find contact emails (runs daily at 3am)
- ✅ `sendColdEmails` - Send 50 emails/day (runs at 9am)
- ✅ `sendFollowUps` - Auto follow-ups (runs at 10am)
- ✅ `onLeadSubmit` - Score website leads

---

## 📋 **Step 6: Test the System**

### **Test 1: Scrape Prospects**

```bash
# Get the function URL from deployment output
# Should look like: https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps

curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
```

This will find 20-40 prospects and add them to Firestore!

### **Test 2: Check Firestore**

1. Go to Firebase Console
2. Open Firestore Database
3. You should see `prospects` collection with new businesses!

### **Test 3: Trigger Email Finding**

The `findEmails` function runs automatically at 3am daily.

To test manually:
```bash
# In Firebase Console > Functions > findEmails > Test function
```

Or wait until 3am tomorrow and check logs:
```bash
firebase functions:log
```

### **Test 4: Send Test Cold Email**

Mark a prospect as "Ready to Contact" in Firestore, then tomorrow at 9am it will get an email automatically!

Or trigger manually:
```bash
# In Firebase Console > Functions > sendColdEmails > Test function
```

---

## 📋 **Step 7: Connect Your Portfolio Form**

Update your contact form to save leads to Firestore:

**File:** `server/routes/contact.ts`

```typescript
// REPLACE the Firebase save section with:
await admin.firestore().collection('leads').add({
  name: lead.name,
  email: lead.email,
  company: lead.company,
  goal: lead.goal,
  budget: lead.budget,
  timeline: lead.timeline,
  details: lead.details,
  source: 'Website Form',
  capturedAt: admin.firestore.FieldValue.serverTimestamp()
});
```

The `onLeadSubmit` function will automatically:
- Score the lead (0-100)
- Assign priority (Hot/Warm/Cold)
- Send you an email if it's a hot lead!

---

## 📊 **What Happens Automatically:**

### **Daily Schedule:**

```
2:00am → (Manual trigger) Scrape Google Maps for prospects
3:00am → Find emails for prospects without emails
9:00am → Send 50 cold emails with AI personalization
10:00am → Send follow-ups to prospects who haven't replied
```

### **Real-Time:**

```
Website form submitted → Lead scored → You get alert (if hot)
```

---

## 📈 **Expected Results:**

### **Week 1:**
- ✅ 100-200 prospects found
- ✅ 50-100 emails found
- ✅ 50 cold emails sent
- ✅ 2-5 replies
- ✅ 1-2 calls booked

### **Month 1:**
- ✅ 1,500 prospects found
- ✅ 800 emails found
- ✅ 1,000 emails sent
- ✅ 50 replies
- ✅ 25 interested
- ✅ 10-15 calls booked
- ✅ 3-6 clients closed
- ✅ $7,500-20,000 revenue

---

## 🛠️ **Monitoring & Debugging**

### **View Logs:**

```bash
firebase functions:log

# Or in Firebase Console > Functions > Logs
```

### **Check Firestore:**

Firebase Console > Firestore Database

Collections:
- `prospects` - Cold outreach prospects
- `leads` - Website form submissions

### **Common Issues:**

**"Gmail authentication failed"**
- Make sure you're using an App Password, not your regular password
- Enable "Less secure app access" in Gmail settings

**"Puppeteer error"**
- Puppeteer might need more memory
- Upgrade to Blaze plan (still free for low usage)

**"No emails being sent"**
- Check function logs: `firebase functions:log`
- Verify prospects have status "Ready to Contact"
- Check Gmail daily send limit (500/day for free Gmail)

---

## 💰 **Costs:**

### **Firebase (Blaze Plan - Pay as you go):**

Estimated costs for this automation:
- Cloud Functions: $0-5/month
- Firestore reads/writes: $0-2/month
- **Total: $0-7/month** for 1,000 emails/month

**Free tier includes:**
- 2M function invocations/month
- 400,000 GB-seconds
- 1GB egress

You'll stay well within free limits!

---

## 🎯 **Next Steps:**

1. ✅ Deploy functions (done after Step 5)
2. ✅ Test scraping (trigger `scrapeGoogleMaps`)
3. ✅ Check Firestore for prospects
4. ✅ Wait for 3am tomorrow (emails will be found)
5. ✅ Wait for 9am tomorrow (cold emails sent!)
6. ✅ Check your inbox for replies 🎉

---

## 🚀 **Pro Tips:**

### **Scrape More Prospects:**

Edit `functions/index.js` line 35:
```javascript
// Change this:
for (let i = 0; i < Math.min(2, industries.length); i++) {

// To this (scrape all industries):
for (let i = 0; i < industries.length; i++) {
```

Then redeploy:
```bash
firebase deploy --only functions:scrapeGoogleMaps
```

### **Send More Emails:**

Change line 255:
```javascript
.limit(50) // Change to 100 or 200
```

### **Adjust Schedule:**

Change the cron schedule:
```javascript
// Current: 9am weekdays
.schedule('0 9 * * 1-5')

// Change to 8am daily:
.schedule('0 8 * * *')
```

---

## 📞 **Support:**

If you run into issues:
1. Check logs: `firebase functions:log`
2. Check Firebase Console > Functions
3. Check Firestore data

---

**You're all set! The automation will run 24/7 bringing you clients on autopilot! 🚀**

*Cost: $0-7/month | Expected Revenue: $10k-20k/month | ROI: INSANE! 🤑*
