import { getFirestore } from '../firebase';
import { FirestoreAppointment } from '@shared/schema';

/**
 * Appointments Service
 * 
 * Query layer for appointment data in Firestore
 * - Fetch upcoming appointments
 * - Fetch past appointments
 * - Get appointment by ID
 * - Update appointment status
 * 
 * Used by:
 * - Frontend dashboard (client/src/pages/Appointments.tsx)
 * - Scheduled completion job
 * - API routes
 */

/**
 * Fetch all upcoming appointments (status = upcoming, startTime > now)
 * Ordered by startTime ascending
 */
export async function getUpcomingAppointments(
  userId?: string
): Promise<FirestoreAppointment[]> {
  const db = getFirestore();
  if (!db) return [];

  try {
    const now = new Date().toISOString();
    let query: FirebaseFirestore.Query = db
      .collection('appointments')
      .where('status', '==', 'upcoming')
      .where('startTime', '>', now)
      .orderBy('startTime', 'asc');

    // Filter by userId if provided
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as FirestoreAppointment);
  } catch (err) {
    console.error('Error fetching upcoming appointments:', err);
    return [];
  }
}

/**
 * Fetch all past appointments (status = completed OR cancelled, startTime <= now)
 * Ordered by startTime descending (most recent first)
 */
export async function getPastAppointments(
  userId?: string
): Promise<FirestoreAppointment[]> {
  const db = getFirestore();
  if (!db) return [];

  try {
    const now = new Date().toISOString();
    let query: FirebaseFirestore.Query = db
      .collection('appointments')
      .where('startTime', '<=', now)
      .orderBy('startTime', 'desc');

    // Filter by userId if provided
    if (userId) {
      query = query.where('userId', '==', userId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as FirestoreAppointment);
  } catch (err) {
    console.error('Error fetching past appointments:', err);
    return [];
  }
}

/**
 * Fetch appointment by ID
 */
export async function getAppointmentById(
  appointmentId: string
): Promise<FirestoreAppointment | null> {
  const db = getFirestore();
  if (!db) return null;

  try {
    const doc = await db.collection('appointments').doc(appointmentId).get();
    if (!doc.exists) return null;
    return doc.data() as FirestoreAppointment;
  } catch (err) {
    console.error('Error fetching appointment:', err);
    return null;
  }
}

/**
 * Find all appointments where endTime < now and status = upcoming
 * Returns these appointments for the completion job to process
 */
export async function getExpiredUpcomingAppointments(): Promise<FirestoreAppointment[]> {
  const db = getFirestore();
  if (!db) return [];

  try {
    const now = new Date().toISOString();
    const query = db
      .collection('appointments')
      .where('status', '==', 'upcoming')
      .where('endTime', '<', now)
      .orderBy('endTime', 'desc');

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => doc.data() as FirestoreAppointment);
  } catch (err) {
    console.error('Error fetching expired upcoming appointments:', err);
    return [];
  }
}

/**
 * Mark appointment as completed
 * Called by scheduled job after appointment endTime has passed
 */
export async function completeAppointment(appointmentId: string): Promise<boolean> {
  const db = getFirestore();
  if (!db) return false;

  try {
    await db.collection('appointments').doc(appointmentId).update({
      status: 'completed',
      updatedAt: new Date().toISOString(),
    });
    console.log(`[Appointments] Marked as completed: ${appointmentId}`);
    return true;
  } catch (err) {
    console.error(`Error completing appointment ${appointmentId}:`, err);
    return false;
  }
}

/**
 * Batch update appointments
 * Completes all appointments where endTime < now
 * Called by scheduled job every 30 minutes
 * Returns count of updated appointments
 */
export async function completeExpiredAppointments(): Promise<number> {
  const db = getFirestore();
  if (!db) return 0;

  try {
    const expired = await getExpiredUpcomingAppointments();
    if (expired.length === 0) {
      console.log('[Appointments] No expired appointments to complete');
      return 0;
    }

    let completed = 0;
    for (const appointment of expired) {
      const success = await completeAppointment(appointment.appointmentId);
      if (success) completed++;
    }

    console.log(`[Appointments] Completed ${completed} / ${expired.length} expired appointments`);
    return completed;
  } catch (err) {
    console.error('Error in batch completion:', err);
    return 0;
  }
}

/**
 * Get appointment statistics
 * Used for dashboard and monitoring
 */
export async function getAppointmentStats(): Promise<{
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
}> {
  const db = getFirestore();
  if (!db) {
    return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  }

  try {
    const snapshot = await db.collection('appointments').get();
    const appointments = snapshot.docs.map((doc) => doc.data() as FirestoreAppointment);

    const stats = {
      total: appointments.length,
      upcoming: appointments.filter((a) => a.status === 'upcoming').length,
      completed: appointments.filter((a) => a.status === 'completed').length,
      cancelled: appointments.filter((a) => a.status === 'cancelled').length,
    };

    return stats;
  } catch (err) {
    console.error('Error fetching appointment stats:', err);
    return { total: 0, upcoming: 0, completed: 0, cancelled: 0 };
  }
}
