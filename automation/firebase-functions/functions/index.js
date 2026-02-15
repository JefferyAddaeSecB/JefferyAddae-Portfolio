const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

// Define secrets
const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');
const adminEmail = defineSecret('ADMIN_EMAIL');
const openrouterKey = defineSecret('OPENROUTER_API_KEY');

// ============================================================
// 🔍 PART 1: FIND PROSPECTS (Google Maps Scraper)
// ============================================================

// Scheduled to run daily at 2am EST
exports.scrapeGoogleMapsScheduled = functions.pubsub
  .schedule('0 2 * * *') // Daily at 2am
  .timeZone('America/Toronto')
  .onRun(async (context) => {
    await scrapeProspects();
    return null;
  });

// HTTP endpoint for manual triggering (public)
exports.scrapeGoogleMaps = functions.runWith({
  memory: '1GB',
  timeoutSeconds: 300
}).https.onRequest(async (req, res) => {
  try {
    const result = await scrapeProspects();
    res.json(result);
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Main scraping logic
async function scrapeProspects() {
  const puppeteer = require('puppeteer');

  const industries = [
    'real estate agent',
    'law firm',
    'dental clinic',
    'restaurant',
    'contractor',
    'salon',
    'gym',
    'medical clinic',
    'accounting firm'
  ];

  const cities = [
    'Toronto', 'Ottawa', 'Mississauga', 'Brampton', 'Hamilton',
    'London', 'Markham', 'Vaughan', 'Kitchener', 'Windsor'
  ];

  let totalAdded = 0;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    // Scrape 2 industry-city combinations (change this to scrape more)
    for (let i = 0; i < Math.min(2, industries.length); i++) {
      const industry = industries[i];
      const city = cities[i % cities.length];

      console.log(`Scraping ${industry} in ${city}...`);

      const url = `https://www.google.com/maps/search/${encodeURIComponent(industry)}+in+${encodeURIComponent(city)}+Ontario`;

      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Wait for results to load
      await page.waitForTimeout(3000);

      // Scroll to load more results
      for (let scroll = 0; scroll < 3; scroll++) {
        await page.evaluate(() => {
          const resultsContainer = document.querySelector('[role="feed"]');
          if (resultsContainer) {
            resultsContainer.scrollTop = resultsContainer.scrollHeight;
          }
        });
        await page.waitForTimeout(2000);
      }

      // Extract business data
      const businesses = await page.evaluate(() => {
        const results = [];
        const items = document.querySelectorAll('[role="article"]');

        items.forEach((item, index) => {
          if (index > 20) return; // Limit to 20 per search

          const nameElement = item.querySelector('[class*="fontHeadline"]');
          const name = nameElement ? nameElement.textContent : null;

          const phoneElement = item.querySelector('[data-tooltip*="phone"]');
          const phone = phoneElement ? phoneElement.getAttribute('aria-label')?.replace('Phone: ', '') : null;

          const websiteElement = item.querySelector('a[data-tooltip*="website"]');
          const website = websiteElement ? websiteElement.href : null;

          const addressElement = item.querySelector('[class*="fontBody"]');
          const address = addressElement ? addressElement.textContent : null;

          if (name) {
            results.push({ name, phone, website, address });
          }
        });

        return results;
      });

      console.log(`Found ${businesses.length} businesses`);

      // Save to Firestore
      for (const business of businesses) {
        // Check if already exists
        const existingSnapshot = await admin.firestore()
          .collection('prospects')
          .where('company', '==', business.name)
          .limit(1)
          .get();

        if (existingSnapshot.empty) {
          await admin.firestore().collection('prospects').add({
            company: business.name,
            phone: business.phone,
            website: business.website,
            address: business.address,
            industry: industry,
            city: city,
            province: 'Ontario',
            country: 'Canada',
            source: 'Google Maps',
            status: 'Need Email',
            needsWebsite: !business.website,
            addedDate: admin.firestore.FieldValue.serverTimestamp(),
            emailAttempts: 0,
            emailSent: false
          });
          totalAdded++;
        }
      }

      await page.close();
    }

    await browser.close();

    return {
      success: true,
      message: `Added ${totalAdded} new prospects!`,
      totalAdded
    };

  } catch (error) {
    console.error('Scraping error:', error);
    throw error;
  }
}

// ============================================================
// 📧 PART 2: FIND EMAILS FOR PROSPECTS
// ============================================================

exports.findEmails = functions.pubsub
  .schedule('0 3 * * *') // Runs at 3am daily
  .timeZone('America/Toronto')
  .onRun(async (context) => {

    const prospectsSnapshot = await admin.firestore()
      .collection('prospects')
      .where('status', '==', 'Need Email')
      .where('emailAttempts', '<', 3)
      .limit(50)
      .get();

    console.log(`Finding emails for ${prospectsSnapshot.size} prospects...`);

    for (const doc of prospectsSnapshot.docs) {
      const prospect = doc.data();
      let emailFound = null;

      try {
        // Method 1: Common email patterns
        if (prospect.website) {
          const domain = extractDomain(prospect.website);
          const commonEmails = [
            `info@${domain}`,
            `contact@${domain}`,
            `hello@${domain}`,
            `admin@${domain}`,
            `sales@${domain}`
          ];

          for (const email of commonEmails) {
            const valid = await verifyEmailExists(email);
            if (valid) {
              emailFound = email;
              break;
            }
          }
        }

        // Method 2: Scrape website for email
        if (!emailFound && prospect.website) {
          emailFound = await scrapeWebsiteForEmail(prospect.website);
        }

        // Update Firestore
        if (emailFound) {
          await doc.ref.update({
            email: emailFound,
            status: 'Ready to Contact',
            emailFoundDate: admin.firestore.FieldValue.serverTimestamp(),
            emailAttempts: admin.firestore.FieldValue.increment(1)
          });
          console.log(`✅ Found email for ${prospect.company}: ${emailFound}`);
        } else {
          await doc.ref.update({
            emailAttempts: admin.firestore.FieldValue.increment(1),
            lastEmailAttempt: admin.firestore.FieldValue.serverTimestamp()
          });
          console.log(`❌ No email found for ${prospect.company}`);
        }

      } catch (error) {
        console.error(`Error finding email for ${prospect.company}:`, error);
        await doc.ref.update({
          emailAttempts: admin.firestore.FieldValue.increment(1)
        });
      }
    }

    return null;
  });

// Helper: Extract domain from URL
function extractDomain(url) {
  try {
    const domain = new URL(url).hostname.replace('www.', '');
    return domain;
  } catch {
    return null;
  }
}

// Helper: Verify email exists via DNS check
async function verifyEmailExists(email) {
  const dns = require('dns').promises;

  try {
    const domain = email.split('@')[1];
    const mxRecords = await dns.resolveMx(domain);
    return mxRecords && mxRecords.length > 0;
  } catch {
    return false;
  }
}

// Helper: Scrape website for email
async function scrapeWebsiteForEmail(website) {
  const puppeteer = require('puppeteer');

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox']
    });

    const page = await browser.newPage();

    // Try contact page first
    const contactUrls = [
      `${website}/contact`,
      `${website}/contact-us`,
      `${website}/about`,
      website
    ];

    for (const url of contactUrls) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

        const email = await page.evaluate(() => {
          const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
          const text = document.body.innerText;
          const matches = text.match(emailRegex);

          // Filter out common false positives
          if (matches) {
            const validEmails = matches.filter(e =>
              !e.includes('example.com') &&
              !e.includes('domain.com') &&
              !e.includes('@sentry') &&
              !e.includes('wixpress')
            );
            return validEmails.length > 0 ? validEmails[0] : null;
          }
          return null;
        });

        if (email) {
          await browser.close();
          return email;
        }
      } catch (err) {
        continue;
      }
    }

    await browser.close();
    return null;

  } catch (error) {
    console.error('Email scraping error:', error);
    return null;
  }
}

// ============================================================
// 💌 PART 3: SEND COLD EMAILS (50 per day)
// ============================================================

exports.sendColdEmails = functions
  .runWith({ secrets: [emailUser, emailPassword, openrouterKey] })
  .pubsub
  .schedule('0 9 * * 1-5') // Monday-Friday at 9am
  .timeZone('America/Toronto')
  .onRun(async (context) => {

    // Get email config from secrets
    const userEmail = emailUser.value();
    const userPassword = emailPassword.value();

    if (!userEmail || !userPassword) {
      console.error('Email credentials not configured!');
      return null;
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: userEmail,
        pass: userPassword
      }
    });

    // Get 50 prospects ready for outreach
    const prospectsSnapshot = await admin.firestore()
      .collection('prospects')
      .where('status', '==', 'Ready to Contact')
      .where('emailSent', '==', false)
      .limit(50)
      .get();

    console.log(`Sending emails to ${prospectsSnapshot.size} prospects...`);

    for (const doc of prospectsSnapshot.docs) {
      const prospect = doc.data();

      try {
        // Generate personalized email with AI
        const personalizedEmail = await generatePersonalizedEmail(prospect, openrouterKey.value());

        // Send email
        await transporter.sendMail({
          from: `Jeffery Addae <${userEmail}>`,
          to: prospect.email,
          subject: `Quick question about ${prospect.company}`,
          text: personalizedEmail,
          headers: {
            'Reply-To': userEmail
          }
        });

        // Update Firestore
        await doc.ref.update({
          status: 'Email Sent',
          emailSent: true,
          emailSentDate: admin.firestore.FieldValue.serverTimestamp(),
          emailContent: personalizedEmail,
          emailCount: 1,
          followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days
        });

        console.log(`✅ Email sent to ${prospect.company}`);

        // Wait 2 seconds between emails to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Error sending to ${prospect.company}:`, error);
        await doc.ref.update({
          emailError: error.message,
          lastEmailAttempt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    }

    return null;
  });

// Helper: Generate personalized email with AI
async function generatePersonalizedEmail(prospect, apiKey) {
  if (!apiKey) {
    // Fallback template if no AI
    return generateFallbackEmail(prospect);
  }

  const openRouterKey = apiKey;

  try {
    const prompt = `Write a short, friendly cold email (under 150 words) for ${prospect.company}, a ${prospect.industry} business in ${prospect.city}, Ontario.

Key points:
- Mention they're in ${prospect.city}
- They could benefit from ${prospect.needsWebsite ? 'a professional website' : 'automation/chatbot to save time'}
- Mention saving 10+ hours per week
- Include clear CTA: book a free 15-min call
- Be conversational, not salesy
- Sign as: Jeffery Addae
- Include LinkedIn: www.linkedin.com/in/jeffery-addae-297214398
- P.S. with booking link: https://www.jefferyaddae.it.com/contact

Keep it under 150 words.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://yourwebsite.com',
        'X-Title': 'Cold Outreach Automation'
      },
      body: JSON.stringify({
        model: 'nvidia/nemotron-3-nano-30b-a3b:free',
        messages: [
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      return data.choices[0].message.content;
    }

    return generateFallbackEmail(prospect);

  } catch (error) {
    console.error('AI generation error:', error);
    return generateFallbackEmail(prospect);
  }
}

// Fallback email template (no AI needed)
function generateFallbackEmail(prospect) {
  return `Hi there,

I came across ${prospect.company} in ${prospect.city} and noticed ${prospect.needsWebsite ? "you don't have a website yet" : "your online presence could use an upgrade"}.

Quick question: Are you still manually handling lead follow-ups and customer inquiries?

Most ${prospect.industry} businesses I work with are losing 10-15 hours per week on tasks that could run automatically.

I help businesses like yours build ${prospect.needsWebsite ? 'professional websites with' : ''} automation systems that:
• Capture and follow up with leads automatically
• Answer common customer questions 24/7
• Save 10+ hours per week

Would it make sense to show you how this works? Free 15-min call this week?

Best,
Jeffery Addae
💼 LinkedIn: www.linkedin.com/in/jeffery-addae-297214398

P.S. Book a call here: https://www.jefferyaddae.it.com/contact`;
}

// ============================================================
// 🔁 PART 4: AUTO FOLLOW-UPS
// ============================================================

exports.sendFollowUps = functions
  .runWith({ secrets: [emailUser, emailPassword] })
  .pubsub
  .schedule('0 10 * * 1-5') // Weekdays at 10am
  .timeZone('America/Toronto')
  .onRun(async (context) => {

    const userEmail = emailUser.value();
    const userPassword = emailPassword.value();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: userEmail, pass: userPassword }
    });

    const today = new Date();

    // Get prospects due for follow-up
    const prospectsSnapshot = await admin.firestore()
      .collection('prospects')
      .where('status', '==', 'Email Sent')
      .where('followUpDate', '<=', today)
      .where('emailCount', '<', 5) // Max 5 emails total
      .limit(50)
      .get();

    console.log(`Sending follow-ups to ${prospectsSnapshot.size} prospects...`);

    for (const doc of prospectsSnapshot.docs) {
      const prospect = doc.data();
      const followUpNumber = prospect.emailCount;

      try {
        const followUpEmail = getFollowUpTemplate(followUpNumber, prospect);
        const subject = getFollowUpSubject(followUpNumber, prospect);

        await transporter.sendMail({
          from: `Jeffery Addae <${userEmail}>`,
          to: prospect.email,
          subject: subject,
          text: followUpEmail
        });

        await doc.ref.update({
          emailCount: admin.firestore.FieldValue.increment(1),
          lastEmailDate: admin.firestore.FieldValue.serverTimestamp(),
          followUpDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        });

        console.log(`✅ Follow-up ${followUpNumber} sent to ${prospect.company}`);

        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`Follow-up error for ${prospect.company}:`, error);
      }
    }

    return null;
  });

// Follow-up email templates
function getFollowUpTemplate(number, prospect) {
  const templates = {
    1: `Hi again,

Just wanted to follow up on my previous email about ${prospect.company}.

I recently helped a ${prospect.industry} in ${prospect.city} automate their lead follow-ups and they're now saving 12 hours/week.

Would love to show you how we could do the same for ${prospect.company}.

Free for a quick 15-min chat this week?

Best,
Jeffery Addae`,

    2: `Hi,

Last email, I promise!

Quick question: Is automating your business processes something you're interested in, or should I stop emailing you?

Just reply "yes" or "no" and I'll know.

Thanks,
Jeffery`,

    3: `Hey,

Haven't heard back, so I'm assuming this isn't a priority right now — totally understandable!

If you ever want to chat about automation, my door's always open.

All the best,
Jeffery Addae`,

    4: `${prospect.company},

This is my final email. I'll stop reaching out after this.

If automation ever becomes a priority, feel free to reach out anytime.

Wishing you continued success!

Jeffery`
  };

  return templates[number] || templates[4];
}

function getFollowUpSubject(number, prospect) {
  const subjects = {
    1: `Re: ${prospect.company}`,
    2: `Last email (I promise) - ${prospect.company}`,
    3: `Following up one more time`,
    4: `Final note for ${prospect.company}`
  };

  return subjects[number] || subjects[4];
}

// ============================================================
// 📥 PART 5: CAPTURE WEBSITE LEADS (from your portfolio form)
// ============================================================

exports.onLeadSubmit = functions
  .runWith({ secrets: [emailUser, emailPassword, adminEmail] })
  .firestore
  .document('leads/{leadId}')
  .onCreate(async (snap, context) => {

    const lead = snap.data();

    // Calculate lead score
    let score = 0;
    let priority = 'Cold';
    const tags = [];

    // Budget scoring (if provided)
    if (lead.budget) {
      if (lead.budget === '$4,000–$10,000+' || lead.budget.includes('10000') || lead.budget.includes('10,000')) {
        score += 40;
        tags.push('High Budget');
      } else if (lead.budget === '$1,500–$4,000' || lead.budget.includes('4000') || lead.budget.includes('1500')) {
        score += 25;
        tags.push('Medium Budget');
      } else if (lead.budget === '$500–$1,200' || lead.budget.includes('500') || lead.budget.includes('1200')) {
        score += 10;
      }
    }

    // Timeline urgency (flexible matching)
    if (lead.timeline) {
      const timelineLower = lead.timeline.toLowerCase();
      if (timelineLower.includes('asap') || timelineLower.includes('urgent') || timelineLower.includes('immediate')) {
        score += 30;
        tags.push('Urgent');
      } else if (timelineLower.includes('1') || timelineLower.includes('week') || timelineLower.includes('soon')) {
        score += 20;
      } else if (timelineLower.includes('2') || timelineLower.includes('month')) {
        score += 10;
      }
    }

    // Goal/Service type (flexible matching)
    if (lead.goal) {
      const goalLower = lead.goal.toLowerCase();
      if (goalLower.includes('automation') || goalLower.includes('ai') || goalLower.includes('chatbot')) {
        score += 20;
        tags.push('High-Value Service');
      }
    }

    // Has company = more serious
    if (lead.company && lead.company.length > 0) {
      score += 10;
      tags.push('Has Company');
    }

    // Determine priority
    if (score >= 70) {
      priority = 'Hot';
      tags.push('🔥 HOT LEAD');
    } else if (score >= 40) {
      priority = 'Warm';
      tags.push('⚡ Warm Lead');
    } else {
      priority = 'Cold';
      tags.push('❄️ Cold Lead');
    }

    // Update lead with score
    await snap.ref.update({
      score,
      priority,
      tags,
      status: 'New',
      followUpDate: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });

    // Send alert if hot lead
    if (priority === 'Hot') {
      await sendHotLeadAlert(
        lead,
        emailUser.value(),
        emailPassword.value(),
        adminEmail.value()
      );
    }

    console.log(`Lead scored: ${lead.name} - ${priority} (${score}/100)`);

    return null;
  });

// Send hot lead alert
async function sendHotLeadAlert(lead, userEmail, userPassword, userAdminEmail) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: userEmail, pass: userPassword }
  });

  try {
    await transporter.sendMail({
      from: userEmail,
      to: userAdminEmail,
      subject: `🔥 HOT LEAD: ${lead.name} - ${lead.budget}`,
      text: `HIGH PRIORITY LEAD RECEIVED!

Name: ${lead.name}
Email: ${lead.email}
Company: ${lead.company}
Budget: ${lead.budget}
Timeline: ${lead.timeline}
Goal: ${lead.goal}

Score: ${lead.score}/100

Details:
${lead.details}

⚡ ACTION REQUIRED: Contact within 1 hour for best conversion rate!

Reply to this email to contact them directly.`
    });

    console.log(`🔥 Hot lead alert sent for ${lead.name}`);
  } catch (error) {
    console.error('Error sending hot lead alert:', error);
  }
}
