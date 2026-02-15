const functions = require('firebase-functions');
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');
const puppeteer = require('puppeteer');
const chromium = require('@sparticuz/chromium');
const { defineSecret } = require('firebase-functions/params');

admin.initializeApp();

// Define secrets
const emailUser = defineSecret('EMAIL_USER');
const emailPassword = defineSecret('EMAIL_PASSWORD');
const adminEmail = defineSecret('ADMIN_EMAIL');
const openrouterKey = defineSecret('OPENROUTER_API_KEY');

const DUCKDUCKGO_HTML_URL = 'https://duckduckgo.com/html/';
const JINA_DUCKDUCKGO_PROXY_URL = 'https://r.jina.ai/http://duckduckgo.com/html/';
const MAX_SEARCH_QUERIES = 8;
const MAX_RESULTS_PER_QUERY = 8;
const SEARCH_MARKET = 'us-en';
const SEARCH_REQUEST_TIMEOUT_MS = 30000;
const EXCLUDED_PROSPECT_DOMAINS = new Set([
  'duckduckgo.com',
  'google.com',
  'bing.com',
  'search.brave.com',
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'youtube.com',
  'x.com',
  'twitter.com',
  'yelp.com',
  'yellowpages.com',
  'realtor.com',
  'zillow.com',
  'tripadvisor.com',
  'mapquest.com',
  'angi.com',
  'thumbtack.com',
  'houzz.com',
  'homeguide.com',
  'effectiveagents.com',
  'ratemyagent.com',
  'avvo.com',
  'findlaw.com',
  'lawyers.com',
  'superlawyers.com',
  'justia.com',
  'zocdoc.com',
  'opencare.com',
  'goodfirms.co',
  'bestlawfirms.com',
  'bcgsearch.com',
  'usnews.com',
  'va.gov',
  'bbb.org',
  'wikipedia.org',
  'opencorporates.com'
]);

async function launchBrowser() {
  const executablePath = await chromium.executablePath();
  if (!executablePath) {
    throw new Error('Chromium executable path could not be resolved.');
  }

  console.log(`Launching bundled Chromium from: ${executablePath}`);

  return puppeteer.launch({
    executablePath,
    headless: true,
    defaultViewport: chromium.defaultViewport,
    args: [...chromium.args, '--no-sandbox', '--disable-dev-shm-usage']
  });
}

// ============================================================
// 🔍 PART 1: FIND PROSPECTS (Google Maps Scraper)
// ============================================================

// Scheduled to run daily at 2am EST
exports.scrapeGoogleMapsScheduled = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 540
  })
  .pubsub
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

  const { cities, country, defaultRegion } = getProspectingLocationConfig();

  let totalAdded = 0;

  try {
    const webProspects = await scrapeProspectsFromWebSearch(industries, cities, country, defaultRegion);

    for (const prospect of webProspects) {
      const inserted = await saveProspectIfNew(prospect);
      if (inserted) {
        totalAdded++;
      }
    }

    // Keep Google Maps as fallback when search indexing doesn't return direct domains.
    if (totalAdded === 0) {
      console.log('Web search produced 0 new prospects. Falling back to Google Maps scraper...');
      const mapProspects = await scrapeProspectsFromGoogleMaps(industries, cities, country, defaultRegion);

      for (const prospect of mapProspects) {
        const inserted = await saveProspectIfNew(prospect);
        if (inserted) {
          totalAdded++;
        }
      }
    }

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

function getProspectingLocationConfig() {
  const regionPreference = String(process.env.PROSPECT_TARGET_REGION || 'US').toUpperCase();
  const useCanada = regionPreference === 'CA';

  const usCities = [
    'Miami, FL',
    'Austin, TX',
    'Dallas, TX',
    'Atlanta, GA',
    'Phoenix, AZ',
    'Charlotte, NC',
    'Tampa, FL',
    'Nashville, TN',
    'Denver, CO',
    'Houston, TX'
  ];

  const canadaCities = [
    'Toronto, ON',
    'Ottawa, ON',
    'Mississauga, ON',
    'Brampton, ON',
    'Hamilton, ON',
    'London, ON',
    'Markham, ON',
    'Vaughan, ON',
    'Kitchener, ON',
    'Windsor, ON'
  ];

  return {
    cities: useCanada ? canadaCities : usCities,
    country: useCanada ? 'Canada' : 'USA',
    defaultRegion: useCanada ? 'ON' : null
  };
}

async function scrapeProspectsFromWebSearch(industries, cities, country, defaultRegion) {
  const prospects = [];
  const seenDomains = new Set();
  const queryCount = Math.min(MAX_SEARCH_QUERIES, industries.length);

  for (let i = 0; i < queryCount; i++) {
    const industry = industries[i];
    const cityLabel = cities[i % cities.length];
    const query = buildSearchQuery(industry, cityLabel, country);

    console.log(`Searching web for prospects: ${query}`);

    try {
      const results = await fetchSearchCandidates(query);
      let accepted = 0;
      const stats = {
        parsed: results.length,
        invalidUrl: 0,
        noDomain: 0,
        duplicate: 0,
        excluded: 0,
        nonCommercial: 0,
        genericTitle: 0
      };

      for (const result of results) {
        const destinationUrl = decodeDuckDuckGoLink(result.href);
        const website = normalizeWebsite(destinationUrl);
        if (!website) {
          stats.invalidUrl++;
          continue;
        }

        const domain = extractDomain(website);
        if (!domain) {
          stats.noDomain++;
          continue;
        }

        if (seenDomains.has(domain)) {
          stats.duplicate++;
          continue;
        }

        if (isExcludedProspectDomain(domain)) {
          stats.excluded++;
          continue;
        }

        if (isNonCommercialDomain(domain)) {
          stats.nonCommercial++;
          continue;
        }

        if (isGenericSearchTitle(result.title)) {
          stats.genericTitle++;
          continue;
        }

        seenDomains.add(domain);
        const { cityName, regionCode } = splitCityAndRegion(cityLabel);
        const company = cleanCompanyName(result.title, domain);

        prospects.push({
          company,
          phone: null,
          website,
          address: null,
          industry,
          city: cityName,
          province: regionCode || defaultRegion,
          country,
          source: 'DuckDuckGo Search',
          status: 'Need Email',
          needsWebsite: false
        });

        accepted++;
        if (accepted >= MAX_RESULTS_PER_QUERY) break;
      }

      console.log(
        `Web prospects for "${industry}" in ${cityLabel}: accepted=${accepted}, parsed=${stats.parsed}, ` +
        `invalidUrl=${stats.invalidUrl}, noDomain=${stats.noDomain}, duplicate=${stats.duplicate}, ` +
        `excluded=${stats.excluded}, nonCommercial=${stats.nonCommercial}, genericTitle=${stats.genericTitle}`
      );
    } catch (error) {
      console.error(`Web search scraping failed for "${query}":`, error.message || error);
    }
  }

  console.log(`Total web prospects collected before dedupe: ${prospects.length}`);
  return prospects;
}

function buildSearchQuery(industry, cityLabel, country) {
  return `${industry} in ${cityLabel} ${country} official website contact -yelp -zillow -realtor -yellowpages -facebook`;
}

async function fetchSearchCandidates(query) {
  const seen = new Set();
  const candidates = [];

  try {
    const html = await fetchDuckDuckGoHtml(query);
    const directResults = parseDuckDuckGoResults(html);
    console.log(`DuckDuckGo direct results parsed for "${query}": ${directResults.length}`);
    mergeSearchCandidates(candidates, seen, directResults);
  } catch (error) {
    console.error(`DuckDuckGo direct request failed for "${query}":`, error.message || error);
  }

  if (candidates.length < MAX_RESULTS_PER_QUERY) {
    try {
      const markdown = await fetchDuckDuckGoViaJina(query);
      const jinaResults = parseJinaDuckDuckGoResults(markdown);
      console.log(`DuckDuckGo via Jina results parsed for "${query}": ${jinaResults.length}`);
      mergeSearchCandidates(candidates, seen, jinaResults);
    } catch (error) {
      console.error(`DuckDuckGo via Jina failed for "${query}":`, error.message || error);
    }
  }

  return candidates;
}

function mergeSearchCandidates(target, seen, results) {
  for (const result of results) {
    const key = `${result.href}::${result.title}`.toLowerCase();
    if (!result.href || !result.title || seen.has(key)) continue;
    seen.add(key);
    target.push(result);
  }
}

async function fetchDuckDuckGoHtml(query) {
  const url = `${DUCKDUCKGO_HTML_URL}?q=${encodeURIComponent(query)}&kl=${SEARCH_MARKET}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ProspectBot/1.0; +https://duckduckgo.com)',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(SEARCH_REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`DuckDuckGo returned HTTP ${response.status}`);
  }

  const html = await response.text();
  if (isSearchChallengePage(html)) {
    throw new Error('DuckDuckGo challenge page returned');
  }

  return html;
}

async function fetchDuckDuckGoViaJina(query) {
  const url = `${JINA_DUCKDUCKGO_PROXY_URL}?q=${encodeURIComponent(query)}&kl=${SEARCH_MARKET}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; ProspectBot/1.0)',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    signal: AbortSignal.timeout(SEARCH_REQUEST_TIMEOUT_MS)
  });

  if (!response.ok) {
    throw new Error(`Jina DuckDuckGo proxy returned HTTP ${response.status}`);
  }

  return response.text();
}

function parseDuckDuckGoResults(html) {
  const results = [];
  const regex = /<a[^>]*class=["'][^"']*result__a[^"']*["'][^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match = regex.exec(html);

  while (match) {
    const href = decodeHtmlEntities(match[1] || '');
    const title = stripHtml(match[2] || '');
    if (href && title) {
      results.push({ href, title });
    }
    match = regex.exec(html);
  }

  return results;
}

function parseJinaDuckDuckGoResults(markdown) {
  const results = [];
  const regex = /(!?)\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/gi;
  let match = regex.exec(markdown);

  while (match) {
    const isImageLink = match[1] === '!';
    const title = stripHtml(match[2] || '');
    const href = decodeHtmlEntities(match[3] || '');

    if (!isImageLink && title && href && !href.includes('duckduckgo.com/html/')) {
      results.push({ href, title });
    }

    match = regex.exec(markdown);
  }

  return results;
}

function isSearchChallengePage(html) {
  const normalized = String(html || '').toLowerCase();
  return normalized.includes('unfortunately, bots use duckduckgo too') ||
    normalized.includes('automated requests') ||
    normalized.includes('/anomaly.js');
}

function decodeDuckDuckGoLink(rawHref) {
  if (!rawHref) return null;

  let href = decodeHtmlEntities(rawHref).trim();
  if (href.startsWith('//')) href = `https:${href}`;
  if (href.startsWith('/')) href = `https://duckduckgo.com${href}`;

  try {
    const parsed = new URL(href);

    if (parsed.hostname.includes('duckduckgo.com')) {
      if (parsed.pathname.startsWith('/l/')) {
        const redirected = parsed.searchParams.get('uddg');
        return redirected ? decodeURIComponent(redirected) : null;
      }
      if (parsed.pathname.startsWith('/y.js')) {
        return null;
      }
    }

    return href;
  } catch {
    return null;
  }
}

function normalizeWebsite(url) {
  if (!url) return null;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return null;
    }

    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '');
    return `${parsed.protocol}//${hostname}`;
  } catch {
    return null;
  }
}

function isExcludedProspectDomain(domain) {
  const normalized = String(domain || '').toLowerCase();
  if (!normalized) return true;

  for (const blocked of EXCLUDED_PROSPECT_DOMAINS) {
    if (normalized === blocked || normalized.endsWith(`.${blocked}`)) {
      return true;
    }
  }

  return false;
}

function isNonCommercialDomain(domain) {
  const normalized = String(domain || '').toLowerCase();
  if (!normalized) return true;
  return normalized.endsWith('.gov') || normalized.endsWith('.edu');
}

function splitCityAndRegion(cityLabel) {
  const [cityPart, regionPart] = String(cityLabel || '').split(',');
  const cityName = (cityPart || '').trim() || String(cityLabel || '').trim();
  const regionCode = (regionPart || '').trim() || null;
  return { cityName, regionCode };
}

function cleanCompanyName(rawTitle, fallbackDomain) {
  let name = String(rawTitle || '').replace(/\s+/g, ' ').trim();

  // Prefer first segment from common title formats.
  const separators = [' | ', ' - ', ' — ', ' :: '];
  for (const separator of separators) {
    if (name.includes(separator)) {
      const first = name.split(separator)[0].trim();
      if (first.length > 2) {
        name = first;
      }
      break;
    }
  }

  if (!name || name.length < 3 || isGenericSearchTitle(name)) {
    return companyNameFromDomain(fallbackDomain);
  }

  return name;
}

function isGenericSearchTitle(title) {
  const lower = String(title || '').toLowerCase();
  const genericMarkers = [
    'top ',
    'best ',
    'find ',
    'reviews',
    'near me',
    'compare',
    'directory',
    'list of'
  ];

  return genericMarkers.some(marker => lower.includes(marker));
}

function companyNameFromDomain(domain) {
  const host = String(domain || '').toLowerCase();
  const noSubdomain = host.split('.').slice(-2, -1)[0] || host;
  return noSubdomain
    .split('-')
    .filter(Boolean)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ') || 'Unknown Company';
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, '\'')
    .replace(/&apos;/g, '\'')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function stripHtml(text) {
  return decodeHtmlEntities(text).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

async function scrapeProspectsFromGoogleMaps(industries, cities, country, defaultRegion) {
  const prospects = [];
  const browser = await launchBrowser();

  try {
    for (let i = 0; i < Math.min(2, industries.length); i++) {
      const industry = industries[i];
      const cityLabel = cities[i % cities.length];
      const { cityName, regionCode } = splitCityAndRegion(cityLabel);

      console.log(`Google Maps fallback: ${industry} in ${cityLabel}...`);

      const url = `https://www.google.com/maps/search/${encodeURIComponent(industry)}+in+${encodeURIComponent(cityLabel)}+${encodeURIComponent(country)}`;
      const page = await browser.newPage();

      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForTimeout(3000);

        for (let scroll = 0; scroll < 3; scroll++) {
          await page.evaluate(() => {
            const resultsContainer = document.querySelector('[role="feed"]');
            if (resultsContainer) {
              resultsContainer.scrollTop = resultsContainer.scrollHeight;
            }
          });
          await page.waitForTimeout(2000);
        }

        const businesses = await page.evaluate(() => {
          const results = [];
          const items = document.querySelectorAll('[role="article"]');

          items.forEach((item, index) => {
            if (index > 20) return;

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

        console.log(`Google Maps fallback found ${businesses.length} businesses`);

        for (const business of businesses) {
          const normalizedWebsite = normalizeWebsite(business.website);
          if (!normalizedWebsite) continue;

          prospects.push({
            company: business.name,
            phone: business.phone || null,
            website: normalizedWebsite,
            address: business.address || null,
            industry,
            city: cityName,
            province: regionCode || defaultRegion,
            country,
            source: 'Google Maps',
            status: 'Need Email',
            needsWebsite: false
          });
        }
      } finally {
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  return prospects;
}

async function saveProspectIfNew(prospect) {
  const collection = admin.firestore().collection('prospects');

  if (prospect.website) {
    const existingByWebsite = await collection
      .where('website', '==', prospect.website)
      .limit(1)
      .get();

    if (!existingByWebsite.empty) {
      return false;
    }
  }

  const existingByCompany = await collection
    .where('company', '==', prospect.company)
    .limit(1)
    .get();

  if (!existingByCompany.empty) {
    return false;
  }

  await collection.add({
    company: prospect.company,
    phone: prospect.phone || null,
    website: prospect.website || null,
    address: prospect.address || null,
    industry: prospect.industry,
    city: prospect.city,
    province: prospect.province || null,
    country: prospect.country,
    source: prospect.source,
    status: 'Need Email',
    needsWebsite: !prospect.website,
    addedDate: admin.firestore.FieldValue.serverTimestamp(),
    emailAttempts: 0,
    emailSent: false
  });

  return true;
}

// ============================================================
// 📧 PART 2: FIND EMAILS FOR PROSPECTS
// ============================================================

exports.findEmails = functions
  .runWith({
    memory: '1GB',
    timeoutSeconds: 540
  })
  .pubsub
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
  try {
    const browser = await launchBrowser();

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
  .runWith({ secrets: [emailUser, emailPassword, adminEmail, openrouterKey] })
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

    // Send owner alert for every lead (Hot/Warm/Cold)
    await sendOwnerLeadAlert(
      lead,
      emailUser.value(),
      emailPassword.value(),
      adminEmail.value(),
      priority,
      score
    );

    // Send automated reply to client
    await sendAutoReplyToClient(
      lead,
      emailUser.value(),
      emailPassword.value(),
      openrouterKey.value(),
      priority,
      score
    );

    console.log(`Lead scored: ${lead.name || lead.full_name || lead.email} - ${priority} (${score}/100)`);

    return null;
  });

// Send owner alert for every lead with priority-specific subject and guidance
async function sendOwnerLeadAlert(lead, userEmail, userPassword, userAdminEmail, priority, score) {
  const normalizedPassword = normalizeGmailAppPassword(userPassword);
  if (!looksLikeGmailAppPassword(normalizedPassword)) {
    console.warn('EMAIL_PASSWORD secret does not look like a 16-character Gmail App Password.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: userEmail, pass: normalizedPassword }
  });

  try {
    const leadName = lead.name || lead.full_name || 'Unknown Lead';
    const leadEmail = lead.email || 'N/A';
    const leadCompany = lead.company || 'Not provided';
    const leadBudget = lead.budget || lead.budget_range || 'Not provided';
    const leadTimeline = lead.timeline || 'Not provided';
    const leadGoal = lead.goal || lead.primary_goal || 'Not provided';
    const leadDetails = lead.details || lead.message || 'No details provided.';

    const subjectPrefix =
      priority === 'Hot'
        ? '🔥 HOT LEAD'
        : priority === 'Warm'
          ? '⚡ WARM LEAD'
          : '❄️ NEW LEAD';

    const recommendedAction =
      priority === 'Hot'
        ? '⚡ ACTION REQUIRED: Contact within 1 hour for best conversion rate!'
        : priority === 'Warm'
          ? '📌 Recommended: Follow up within 24 hours.'
          : '🗂 Keep in nurture sequence with a personalized follow-up.';

    await transporter.sendMail({
      from: userEmail,
      to: userAdminEmail,
      subject: `${subjectPrefix}: ${leadName} - ${leadBudget}`,
      text: `NEW LEAD RECEIVED!

Priority: ${priority}
Score: ${score}/100

Name: ${leadName}
Email: ${leadEmail}
Company: ${leadCompany}
Budget: ${leadBudget}
Timeline: ${leadTimeline}
Goal: ${leadGoal}

Details:
${leadDetails}

${recommendedAction}

Reply to this email to contact them directly.`
    });

    console.log(`📩 Owner lead alert sent (${priority}) for ${leadName}`);
  } catch (error) {
    console.error('Error sending owner lead alert:', error);
  }
}

// Send automated reply to client
async function sendAutoReplyToClient(lead, userEmail, userPassword, apiKey, priority, score) {
  const normalizedPassword = normalizeGmailAppPassword(userPassword);
  if (!looksLikeGmailAppPassword(normalizedPassword)) {
    console.warn('EMAIL_PASSWORD secret does not look like a 16-character Gmail App Password.');
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: userEmail, pass: normalizedPassword }
  });

  try {
    const nameSource = lead.firstName || lead.name || lead.full_name || '';
    const firstName = String(nameSource).trim().split(' ')[0] || 'there';

    // Generate personalized response based on message content
    const replyContent = await generateAutoReply(lead, apiKey, priority, score);

    // Determine subject based on priority
    const subject = priority === 'Hot'
      ? `Thanks ${firstName}! Let's talk soon 🚀`
      : `Thanks for reaching out, ${firstName}!`;

    await transporter.sendMail({
      from: `Jeffery Addae <${userEmail}>`,
      to: lead.email,
      subject: subject,
      html: replyContent,
      text: replyContent.replace(/<[^>]*>/g, '') // Strip HTML for text version
    });

    console.log(`✅ Auto-reply sent to ${lead.email}`);
  } catch (error) {
    console.error('Error sending auto-reply:', error);
  }
}

// Generate personalized auto-reply with AI
async function generateAutoReply(lead, apiKey, priority, score) {
  const nameSource = lead.firstName || lead.name || lead.full_name || '';
  const firstName = String(nameSource).trim().split(' ')[0] || 'there';
  const message = lead.details || lead.message || '';
  const goal = lead.goal || '';
  const timeline = lead.timeline || '';

  // Determine message type
  let messageType = 'general';
  const messageLower = (message + ' ' + goal).toLowerCase();

  if (messageLower.includes('automation') || messageLower.includes('ai') || messageLower.includes('chatbot')) {
    messageType = 'automation';
  } else if (messageLower.includes('website') || messageLower.includes('web dev') || messageLower.includes('fullstack')) {
    messageType = 'website';
  } else if (messageLower.includes('hire') || messageLower.includes('job') || messageLower.includes('work')) {
    messageType = 'hiring';
  } else if (messageLower.includes('collaborate') || messageLower.includes('partnership')) {
    messageType = 'collaboration';
  }

  // Use AI to generate personalized response if API key available
  if (apiKey) {
    try {
      const prompt = `You are Jeffery Addae, a fullstack developer and automation specialist. Write a warm, professional auto-reply email to ${firstName} who just contacted you.

Their message: "${message}"
Message type: ${messageType}
Priority: ${priority}
Lead score: ${score}/100
${timeline ? `Timeline: ${timeline}` : ''}
${goal ? `Goal: ${goal}` : ''}

Instructions:
- Thank them for reaching out
- Acknowledge what they're interested in (${messageType === 'automation' ? 'automation/AI services' : messageType === 'website' ? 'web development' : messageType === 'hiring' ? 'potential opportunity' : 'connecting'})
- ${priority === 'Hot' ? 'Express excitement and mention you\'ll reach out within 24 hours' : 'Mention you\'ll get back to them soon'}
- Keep it warm, professional, and conversational (not salesy)
- Include a subtle CTA to book a call: https://www.jefferyaddae.it.com/contact
- Sign off with "Best, Jeffery"
- Keep it under 150 words
- Use HTML formatting (paragraphs, line breaks)

Write the email:`;

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://www.jefferyaddae.it.com',
          'X-Title': 'Auto Reply Generator'
        },
        body: JSON.stringify({
          model: 'nvidia/nemotron-3-nano-30b-a3b:free',
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      if (data.choices && data.choices[0]) {
        return data.choices[0].message.content;
      }
    } catch (error) {
      console.error('AI generation error for auto-reply:', error);
    }
  }

  // Fallback templates based on message type
  return generateFallbackAutoReply(firstName, messageType, priority, timeline);
}

// Fallback auto-reply templates
function generateFallbackAutoReply(firstName, messageType, priority, timeline) {
  const urgentNote = priority === 'Hot'
    ? `<p><strong>I see this is time-sensitive!</strong> I'll prioritize getting back to you within 24 hours. ${timeline === 'ASAP' || timeline.includes('urgent') ? 'Given your urgent timeline, expect to hear from me very soon.' : ''}</p>`
    : '';

  const templates = {
    automation: `<p>Hi ${firstName},</p>

<p>Thanks for reaching out about automation services! 🚀</p>

<p>I help businesses save 10+ hours per week by automating repetitive tasks like lead follow-ups, customer support, and data entry. Most clients see ROI within the first month.</p>

${urgentNote}

<p>I'd love to learn more about your specific needs. Feel free to <a href="https://www.jefferyaddae.it.com/contact">book a free 15-min call</a> on my calendar, or I'll reach out shortly.</p>

<p>Best,<br>Jeffery Addae<br>
💼 <a href="https://www.linkedin.com/in/jeffery-addae-297214398">LinkedIn</a></p>`,

    website: `<p>Hi ${firstName},</p>

<p>Thanks for your interest in web development! 💻</p>

<p>I specialize in building modern, responsive websites and fullstack applications. Whether you need a portfolio, business site, or custom web app, I can help bring your vision to life.</p>

${urgentNote}

<p>Let's discuss your project! You can <a href="https://www.jefferyaddae.it.com/contact">schedule a quick call</a>, or I'll follow up with you soon.</p>

<p>Best,<br>Jeffery Addae<br>
🌐 <a href="https://www.jefferyaddae.it.com">jefferyaddae.it.com</a></p>`,

    hiring: `<p>Hi ${firstName},</p>

<p>Thanks for reaching out about opportunities! 🎯</p>

<p>I'm a fullstack developer specializing in React, Node.js, TypeScript, and automation systems. I'm passionate about building scalable solutions that solve real business problems.</p>

${urgentNote}

<p>I'd love to learn more about the role. Feel free to <a href="https://www.jefferyaddae.it.com/contact">book time on my calendar</a>, or I'll get back to you shortly.</p>

<p>Best,<br>Jeffery Addae<br>
💼 <a href="https://www.linkedin.com/in/jeffery-addae-297214398">LinkedIn</a> | 🌐 <a href="https://www.jefferyaddae.it.com">Portfolio</a></p>`,

    collaboration: `<p>Hi ${firstName},</p>

<p>Thanks for reaching out about collaborating! 🤝</p>

<p>I'm always interested in connecting with fellow developers, designers, and entrepreneurs. Whether it's partnering on projects, sharing insights, or exploring new opportunities, I'm open to the conversation.</p>

${urgentNote}

<p>Let's connect! You can <a href="https://www.jefferyaddae.it.com/contact">schedule a call</a>, or I'll reach out soon.</p>

<p>Best,<br>Jeffery Addae<br>
💼 <a href="https://www.linkedin.com/in/jeffery-addae-297214398">LinkedIn</a></p>`,

    general: `<p>Hi ${firstName},</p>

<p>Thanks for reaching out! 👋</p>

<p>I appreciate you taking the time to connect. I'm a fullstack developer and automation specialist who helps businesses build modern web applications and automate their workflows.</p>

${urgentNote}

<p>I'll review your message and get back to you shortly. In the meantime, feel free to <a href="https://www.jefferyaddae.it.com/contact">book a time on my calendar</a> if you'd like to chat sooner.</p>

<p>Best,<br>Jeffery Addae<br>
🌐 <a href="https://www.jefferyaddae.it.com">jefferyaddae.it.com</a> | 💼 <a href="https://www.linkedin.com/in/jeffery-addae-297214398">LinkedIn</a></p>`
  };

  return templates[messageType] || templates.general;
}

function normalizeGmailAppPassword(password) {
  return String(password || '').replace(/\s+/g, '');
}

function looksLikeGmailAppPassword(password) {
  return typeof password === 'string' && password.length === 16;
}
