/**
 * Firebase Functions decommission notice
 * -------------------------------------
 * This project moved lead-gen, cold email, and contact-response automation to n8n.
 *
 * Intentionally exports no Firebase Cloud Functions:
 * - scrapeGoogleMapsScheduled
 * - scrapeGoogleMaps
 * - findEmails
 * - sendColdEmails
 * - sendFollowUps
 * - onLeadSubmit
 *
 * After deploying this file, Firebase will prompt deletion of the previously
 * deployed functions that are no longer exported.
 */

module.exports = {};
