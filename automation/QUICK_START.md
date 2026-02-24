# ⚠️ QUICK START (Deprecated Firebase Flow)

This document describes the old Firebase-based scraping and outreach system.

Current production direction:
- Use n8n for prospect discovery
- Use n8n for cold outreach/follow-ups
- Use n8n for contact-form auto-response

For Firebase cleanup commands, see `automation/firebase-functions/README.md`.

---

# 🚀 LEGACY QUICK START - Deploy in 15 Minutes

## ✅ **Step-by-Step Setup**

### **1. Install Firebase CLI** (if you haven't already)

```bash
npm install -g firebase-tools
firebase login
```

---

### **2. Navigate to Functions Directory**

```bash
cd automation/firebase-functions
```

---

### **3. Initialize Firebase** (connects to jeffery-addae-automation)

```bash
firebase use jeffery-addae-automation
```

You should see:
```
Now using project jeffery-addae-automation
```

---

### **4. Install Dependencies**

```bash
cd functions
npm install
```

---

### **5. Set Up Environment Variables**

```bash
# Copy example env file
cp .env.example .env

# Edit with your credentials
nano .env
```

**Add your credentials:**

```env
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASSWORD=your-gmail-app-password
ADMIN_EMAIL=your-gmail@gmail.com
OPENROUTER_API_KEY=sk-or-v1-your-key
```

**How to get Gmail App Password:**
1. Go to: https://myaccount.google.com/apppasswords
2. Create new app password for "Mail"
3. Copy the 16-character password
4. Paste it in `.env` as `EMAIL_PASSWORD`

---

### **6. Set Firebase Environment Config**

```bash
# Set environment variables in Firebase
firebase functions:config:set \
  email.user="your-gmail@gmail.com" \
  email.password="your-app-password" \
  email.admin="your-gmail@gmail.com" \
  openrouter.key="sk-or-v1-your-key"
```

---

### **7. Deploy Functions** 🚀

```bash
cd functions
firebase deploy --only functions
```

This will take 2-3 minutes. You'll see:

```
✔  functions[scrapeGoogleMaps(us-central1)] Successful create operation.
✔  functions[findEmails(us-central1)] Successful create operation.
✔  functions[sendColdEmails(us-central1)] Successful create operation.
✔  functions[sendFollowUps(us-central1)] Successful create operation.
✔  functions[onLeadSubmit(us-central1)] Successful create operation.

✔  Deploy complete!

Function URL (scrapeGoogleMaps):
https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
```

---

### **8. Test the System** 🧪

**Find your first prospects:**

```bash
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
```

Expected response:
```json
{
  "success": true,
  "message": "Added 23 new prospects!",
  "totalAdded": 23
}
```

---

### **9. Check Firestore** 📊

1. Go to: https://console.firebase.google.com/project/jeffery-addae-automation/firestore
2. You should see a new collection: `prospects`
3. Each prospect has:
   - company name
   - phone
   - website
   - address
   - industry
   - city
   - status: "Need Email"

---

### **10. Wait for Automation** ⏰

The system now runs automatically:

**Tonight at 3:00am EST:**
- ✅ Finds emails for all prospects

**Tomorrow at 9:00am EST:**
- ✅ Sends 50 personalized cold emails

**Tomorrow at 10:00am EST:**
- ✅ Checks for replies
- ✅ Sends follow-ups

---

## 🎯 **What to Expect:**

### **Day 1 (Today):**
- ✅ Functions deployed
- ✅ 20-40 prospects found
- ✅ Waiting for tomorrow at 3am

### **Day 2 (Tomorrow):**
- ✅ 3am: Emails found for prospects
- ✅ 9am: 50 cold emails sent
- ✅ Evening: 2-5 replies in your inbox!

### **Week 1:**
- ✅ 200+ prospects found
- ✅ 100+ emails found
- ✅ 250 cold emails sent
- ✅ 10-15 replies
- ✅ 5-8 interested prospects
- ✅ 2-4 calls booked

### **Month 1:**
- ✅ 1,500 prospects found
- ✅ 800 emails found
- ✅ 1,000 cold emails sent
- ✅ 50 replies
- ✅ 25 interested
- ✅ 12 calls booked
- ✅ **4-6 clients closed = $10k-20k revenue** 🤑

---

## 🔧 **Optional: Scrape More Prospects**

Want more than 20-40 prospects? Trigger the scraper again:

```bash
# Trigger it 5 times to get 100-200 prospects
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
curl https://us-central1-jeffery-addae-automation.cloudfunctions.net/scrapeGoogleMaps
```

Or schedule it daily:
- Go to: https://console.firebase.google.com/project/jeffery-addae-automation/functions
- Find `scrapeGoogleMaps`
- Add a scheduled trigger: daily at 2am

---

## 📊 **Monitor Your Automation**

### **View Logs:**

```bash
firebase functions:log
```

### **View Prospects:**

https://console.firebase.google.com/project/jeffery-addae-automation/firestore/data/prospects

### **View Leads (from your website):**

https://console.firebase.google.com/project/jeffery-addae-automation/firestore/data/leads

---

## 🚨 **Troubleshooting:**

**"Firebase command not found"**
```bash
npm install -g firebase-tools
```

**"Permission denied"**
```bash
firebase login
```

**"No prospects found"**
- Check logs: `firebase functions:log`
- Make sure you're on Firebase Blaze plan (pay-as-you-go, still free tier)

**"Emails not sending"**
- Double-check Gmail App Password
- Make sure you set Firebase config (step 6)
- Check status in Firestore: should be "Ready to Contact"

---

## 🎉 **YOU'RE DONE!**

Your automation is now running 24/7!

**What happens next:**
1. System finds prospects automatically
2. System finds emails automatically
3. System sends cold emails automatically (50/day)
4. System sends follow-ups automatically
5. You wake up to replies in your inbox
6. You send Calendly link
7. They book a call
8. You close the deal
9. Repeat! 🚀

---

**Total Setup Time: 15 minutes**
**Monthly Cost: $0-7**
**Expected Revenue: $10k-20k/month**

## LET'S GOOO! 🔥🔥🔥
