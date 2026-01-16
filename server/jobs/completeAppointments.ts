import { completeExpiredAppointments, getAppointmentStats } from '../services/appointments';

/**
 * Scheduled Job: Complete Expired Appointments
 * 
 * Runs every 30 minutes
 * 
 * Task:
 * - Find all appointments where status = "upcoming" AND endTime < now
 * - Update their status to "completed"
 * 
 * Why needed:
 * Calendly doesn't automatically mark sessions as completed
 * This job keeps Firestore accurate as the source of truth
 * 
 * Deployment notes:
 * - For production: use Firebase Cloud Scheduler + Cloud Functions
 * - For local dev: use node-schedule or similar
 */

export async function completeExpiredAppointmentsJob(): Promise<void> {
  try {
    console.log('[Job] Starting: Complete Expired Appointments');
    const startTime = Date.now();

    // Get stats before
    const statsBefore = await getAppointmentStats();
    console.log('[Job] Stats before:', statsBefore);

    // Complete all expired appointments
    const completed = await completeExpiredAppointments();

    // Get stats after
    const statsAfter = await getAppointmentStats();
    console.log('[Job] Stats after:', statsAfter);

    const duration = Date.now() - startTime;
    console.log(`[Job] Completed: Processed ${completed} appointments in ${duration}ms`);
  } catch (err) {
    console.error('[Job] Error in completeExpiredAppointmentsJob:', err);
    // Don't throw — jobs should handle errors gracefully
  }
}

/**
 * For Firebase Cloud Functions:
 * 
 * export const completeAppointmentsScheduled = functions.pubsub
 *   .schedule('every 30 minutes')
 *   .onRun(async (context) => {
 *     await completeExpiredAppointmentsJob();
 *   });
 */

/**
 * For Node.js / Express (local or self-hosted):
 * 
 * import schedule from 'node-schedule';
 * 
 * // In your server initialization (e.g., server/index.ts):
 * schedule.scheduleJob('* * * * 0,30', () => {
 *   completeExpiredAppointmentsJob().catch(err => {
 *     console.error('Scheduled job failed:', err);
 *   });
 * });
 */
