import crypto from 'crypto';
import { getFirestore } from '../firebase';

/**
 * Calendly Webhook Validator & Logger
 * - Validates HMAC signatures from Calendly
 * - Logs all webhook events to Firestore for audit trail
 * - Provides idempotency helpers
 */

interface CalendlyWebhookPayload {
  event: string;
  created_at: string;
  data: {
    event?: {
      uri?: string;
      name?: string;
    };
    invitee?: {
      uri?: string;
      email?: string;
      name?: string;
      first_name?: string;
      last_name?: string;
      timezone?: string;
      created_at?: string;
      updated_at?: string;
      event?: {
        uri?: string;
      };
    };
    cancel_url?: string;
    reschedule_url?: string;
    [key: string]: unknown;
  };
}

/**
 * Validates Calendly webhook signature using HMAC-SHA256
 * @param signature - X-Calendly-Signature header value
 * @param payload - Raw request body as string
 * @param secret - CALENDLY_WEBHOOK_SECRET from env
 * @returns true if signature is valid
 */
export function validateCalendlySignature(
  signature: string,
  payload: string,
  secret: string
): boolean {
  if (!signature || !secret) {
    console.warn('Missing signature or secret for webhook validation');
    return false;
  }

  try {
    const expected = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');

    // Constant-time comparison to prevent timing attacks
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
  } catch (err) {
    console.error('Webhook signature validation failed:', err);
    return false;
  }
}

/**
 * Logs webhook event to Firestore for audit trail and debugging
 * @param event_type - invitee.created, invitee.cancelled, invitee.rescheduled
 * @param status - success | error | skipped
 * @param error_message - Optional error details
 * @param calendly_event_id - Optional Calendly event ID
 * @param raw_payload - Optional raw event data
 */
export async function logWebhookEvent(
  event_type: string,
  status: 'success' | 'error' | 'skipped',
  error_message?: string,
  calendly_event_id?: string,
  raw_payload?: Record<string, unknown>
): Promise<string | null> {
  const db = getFirestore();
  if (!db) {
    console.warn('Firestore not available; webhook log not persisted');
    return null;
  }

  try {
    const logEntry = {
      webhookLogId: `log_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      event_type,
      calendly_event_id: calendly_event_id || null,
      status,
      error_message: error_message || null,
      raw_payload: raw_payload || null,
      processedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('webhook_logs').add(logEntry);
    console.log(`[Webhook Log] ${event_type} -> ${status} (ID: ${docRef.id})`);
    return docRef.id;
  } catch (err) {
    console.error('Failed to log webhook event:', err);
    return null;
  }
}

/**
 * Extracts key identifiers from Calendly webhook payload
 */
export function extractCalendlyIds(payload: CalendlyWebhookPayload): {
  calendly_event_id: string | null;
  calendly_invitee_id: string | null;
  invitee_email: string | null;
  event_name: string | null;
} {
  const calendly_event_id = payload.data.event?.uri?.split('/').pop() || null;
  const calendly_invitee_id = payload.data.invitee?.uri?.split('/').pop() || null;
  const invitee_email = payload.data.invitee?.email || null;
  const event_name = payload.data.event?.name || null;

  return {
    calendly_event_id,
    calendly_invitee_id,
    invitee_email,
    event_name,
  };
}

/**
 * Checks if an appointment already exists in Firestore (idempotency)
 * Prevents duplicate appointments from webhook retries
 */
export async function appointmentExists(
  calendly_invitee_id: string
): Promise<boolean> {
  const db = getFirestore();
  if (!db) return false;

  try {
    const query = db
      .collection('appointments')
      .where('calendlyInviteeId', '==', calendly_invitee_id)
      .limit(1);

    const snapshot = await query.get();
    return !snapshot.empty;
  } catch (err) {
    console.error('Error checking appointment existence:', err);
    return false;
  }
}

/**
 * Finds or creates a user record by email in Firestore
 * Used to link appointments to users
 */
export async function findOrCreateUser(
  email: string,
  name?: string
): Promise<string | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    // Try to find existing user
    const query = db
      .collection('users')
      .where('email', '==', email)
      .limit(1);

    const snapshot = await query.get();
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return doc.id;
    }

    // Create new user if not found
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    await db.collection('users').doc(userId).set({
      userId,
      full_name: name || email,
      email,
      createdAt: new Date().toISOString(),
    });

    console.log(`[User] Created new user: ${userId} (${email})`);
    return userId;
  } catch (err) {
    console.error('Error finding/creating user:', err);
    return null;
  }
}
