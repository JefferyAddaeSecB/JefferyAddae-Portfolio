import { getFirestore } from '../firebase';
import {
  validateCalendlySignature,
  logWebhookEvent,
  extractCalendlyIds,
  appointmentExists,
  findOrCreateUser,
} from '../services/webhookValidator';

/**
 * Calendly Webhook Handler
 * 
 * Listens for:
 * - invitee.created → Create appointment, link user
 * - invitee.cancelled → Mark appointment as cancelled
 * - invitee.rescheduled → Update appointment times
 * 
 * All writes go to Firestore (source of truth)
 * Responses are n8n-compatible JSON
 * 
 * Security:
 * - HMAC signature validation required
 * - Idempotent (prevents duplicate appointments)
 * - All events logged to webhook_logs collection
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
      scheduling_method?: string;
      event?: {
        uri?: string;
      };
      text_reminder_number?: string;
      email_reminder?: boolean;
      location?: {
        type?: string;
        address?: string;
      };
      questions_and_answers?: Array<{
        question?: string;
        answer?: string;
      }>;
      start_time?: string;
      end_time?: string;
    };
    cancel_url?: string;
    reschedule_url?: string;
    [key: string]: unknown;
  };
}

/**
 * POST /api/webhooks/calendly
 * 
 * Main webhook entry point
 * Validates signature, routes to appropriate handler, returns n8n-compatible response
 */
export async function handleCalendlyWebhook(
  payload: CalendlyWebhookPayload,
  signature: string
): Promise<{
  status: 'success' | 'error' | 'skipped';
  event_type: string;
  appointmentId?: string;
  error?: string;
  message?: string;
}> {
  const db = getFirestore();
  if (!db) {
    return {
      status: 'error',
      event_type: payload.event,
      error: 'Firestore not configured',
    };
  }

  // Validate webhook signature
  const secret = process.env.CALENDLY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Calendly] CALENDLY_WEBHOOK_SECRET not configured');
    await logWebhookEvent(
      payload.event,
      'error',
      'Missing CALENDLY_WEBHOOK_SECRET',
      extractCalendlyIds(payload).calendly_event_id || undefined
    );
    return {
      status: 'error',
      event_type: payload.event,
      error: 'Webhook secret not configured',
    };
  }

  // Validate signature
  const payloadString = JSON.stringify(payload);
  if (!validateCalendlySignature(signature, payloadString, secret)) {
    console.error('[Calendly] Invalid webhook signature');
    await logWebhookEvent(
      payload.event,
      'error',
      'Invalid HMAC signature',
      extractCalendlyIds(payload).calendly_event_id || undefined,
      payload.data
    );
    return {
      status: 'error',
      event_type: payload.event,
      error: 'Invalid signature',
    };
  }

  // Route to appropriate handler
  try {
    switch (payload.event) {
      case 'invitee.created':
        return await handleInviteeCreated(payload);
      case 'invitee.cancelled':
        return await handleInviteeCancelled(payload);
      case 'invitee.rescheduled':
        return await handleInviteeRescheduled(payload);
      default:
        console.warn(`[Calendly] Unknown event type: ${payload.event}`);
        await logWebhookEvent(payload.event, 'skipped', `Unknown event type`);
        return {
          status: 'skipped',
          event_type: payload.event,
          message: 'Event type not handled',
        };
    }
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    const { calendly_event_id } = extractCalendlyIds(payload);
    await logWebhookEvent(
      payload.event,
      'error',
      errMsg,
      calendly_event_id || undefined,
      payload.data
    );
    console.error(`[Calendly] Handler error for ${payload.event}:`, err);
    return {
      status: 'error',
      event_type: payload.event,
      error: errMsg,
    };
  }
}

/**
 * Handler: invitee.created
 * 
 * Creates a new appointment record in Firestore
 * Links to or creates user by email
 * Status: upcoming
 */
async function handleInviteeCreated(
  payload: CalendlyWebhookPayload
): Promise<{
  status: 'success' | 'error';
  event_type: string;
  appointmentId?: string;
  error?: string;
}> {
  const db = getFirestore();
  if (!db) throw new Error('Firestore unavailable');

  const invitee = payload.data.invitee;
  if (!invitee?.email || !invitee.start_time || !invitee.end_time) {
    throw new Error('Missing required invitee fields');
  }

  const { calendly_event_id, calendly_invitee_id } = extractCalendlyIds(payload);
  if (!calendly_event_id || !calendly_invitee_id) {
    throw new Error('Missing Calendly IDs');
  }

  // Check for duplicates (idempotency)
  const exists = await appointmentExists(calendly_invitee_id);
  if (exists) {
    console.log(`[Calendly] Appointment already exists: ${calendly_invitee_id}`);
    await logWebhookEvent(
      payload.event,
      'skipped',
      'Duplicate appointment (already exists)',
      calendly_event_id
    );
    return {
      status: 'success',
      event_type: payload.event,
      message: 'Duplicate (appointment already exists)',
    };
  }

  // Find or create user
  const userId = await findOrCreateUser(invitee.email, invitee.name);

  // Create appointment record
  const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const appointmentData = {
    appointmentId,
    userId: userId || null,
    email: invitee.email,
    calendlyEventId: calendly_event_id,
    calendlyInviteeId: calendly_invitee_id,
    serviceType: payload.data.event?.name || 'Discovery Call',
    duration: 45, // Default; adjust based on your Calendly event
    status: 'upcoming',
    startTime: invitee.start_time,
    endTime: invitee.end_time,
    timezone: invitee.timezone || 'UTC',
    lead_source: 'website',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    cancelledAt: null,
  };

  await db.collection('appointments').doc(appointmentId).set(appointmentData);

  console.log(`[Calendly] Appointment created: ${appointmentId}`);
  await logWebhookEvent(
    payload.event,
    'success',
    undefined,
    calendly_event_id,
    payload.data
  );

  return {
    status: 'success',
    event_type: payload.event,
    appointmentId,
  };
}

/**
 * Handler: invitee.cancelled
 * 
 * Updates existing appointment status to cancelled
 * Records cancellation timestamp
 */
async function handleInviteeCancelled(
  payload: CalendlyWebhookPayload
): Promise<{
  status: 'success' | 'error';
  event_type: string;
  error?: string;
}> {
  const db = getFirestore();
  if (!db) throw new Error('Firestore unavailable');

  const { calendly_invitee_id, calendly_event_id } = extractCalendlyIds(payload);
  if (!calendly_invitee_id || !calendly_event_id) {
    throw new Error('Missing Calendly IDs');
  }

  // Find appointment by invitee ID
  const query = db
    .collection('appointments')
    .where('calendlyInviteeId', '==', calendly_invitee_id)
    .limit(1);

  const snapshot = await query.get();
  if (snapshot.empty) {
    console.warn(`[Calendly] Appointment not found for cancellation: ${calendly_invitee_id}`);
    await logWebhookEvent(
      payload.event,
      'skipped',
      'Appointment not found',
      calendly_event_id
    );
    return {
      status: 'success',
      event_type: payload.event,
    };
  }

  const docId = snapshot.docs[0].id;
  await db.collection('appointments').doc(docId).update({
    status: 'cancelled',
    updatedAt: new Date().toISOString(),
    cancelledAt: new Date().toISOString(),
  });

  console.log(`[Calendly] Appointment cancelled: ${docId}`);
  await logWebhookEvent(payload.event, 'success', undefined, calendly_event_id);

  return {
    status: 'success',
    event_type: payload.event,
  };
}

/**
 * Handler: invitee.rescheduled
 * 
 * Updates existing appointment with new start/end times
 * Preserves original appointmentId and userId
 */
async function handleInviteeRescheduled(
  payload: CalendlyWebhookPayload
): Promise<{
  status: 'success' | 'error';
  event_type: string;
  error?: string;
}> {
  const db = getFirestore();
  if (!db) throw new Error('Firestore unavailable');

  const invitee = payload.data.invitee;
  if (!invitee?.start_time || !invitee.end_time) {
    throw new Error('Missing new time fields');
  }

  const { calendly_invitee_id, calendly_event_id } = extractCalendlyIds(payload);
  if (!calendly_invitee_id || !calendly_event_id) {
    throw new Error('Missing Calendly IDs');
  }

  // Find appointment by invitee ID
  const query = db
    .collection('appointments')
    .where('calendlyInviteeId', '==', calendly_invitee_id)
    .limit(1);

  const snapshot = await query.get();
  if (snapshot.empty) {
    console.warn(`[Calendly] Appointment not found for rescheduling: ${calendly_invitee_id}`);
    await logWebhookEvent(
      payload.event,
      'skipped',
      'Appointment not found',
      calendly_event_id
    );
    return {
      status: 'success',
      event_type: payload.event,
    };
  }

  const docId = snapshot.docs[0].id;
  await db.collection('appointments').doc(docId).update({
    startTime: invitee.start_time,
    endTime: invitee.end_time,
    timezone: invitee.timezone || 'UTC',
    updatedAt: new Date().toISOString(),
    // Keep status as-is (don't reset to upcoming if already completed/cancelled)
  });

  console.log(`[Calendly] Appointment rescheduled: ${docId}`);
  await logWebhookEvent(payload.event, 'success', undefined, calendly_event_id);

  return {
    status: 'success',
    event_type: payload.event,
  };
}
