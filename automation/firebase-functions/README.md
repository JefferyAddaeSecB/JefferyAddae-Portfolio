# Firebase Functions (Deprecated)

This directory is intentionally decommissioned for lead generation + outreach.

The following automations were removed from Firebase and migrated to n8n:
- `scrapeGoogleMapsScheduled`
- `scrapeGoogleMaps`
- `findEmails`
- `sendColdEmails`
- `sendFollowUps`
- `onLeadSubmit`

## Current automation source of truth
- n8n workflows for prospect discovery
- n8n workflows for cold outreach/follow-ups
- n8n workflow for contact-form auto response

## Remove old deployed Firebase functions
Run from `automation/firebase-functions`:

```bash
firebase deploy --only functions --project jeffery-addae-automation
```

If any old functions still remain, delete them explicitly:

```bash
firebase functions:delete scrapeGoogleMapsScheduled scrapeGoogleMaps findEmails sendColdEmails sendFollowUps onLeadSubmit --project jeffery-addae-automation
```

## Website integration
The site now forwards leads to `N8N_WEBHOOK_URL` (server/API route) and no longer sends SMTP auto-replies in app code.
