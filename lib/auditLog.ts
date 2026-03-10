import { adminDb as db } from '@/firebase/firebaseAdmin';

export type AuditAction =
  | 'CREATE_COURSE'
  | 'UPDATE_COURSE'
  | 'DELETE_COURSE'
  | 'CREATE_TOOL'
  | 'UPDATE_TOOL'
  | 'DELETE_TOOL'
  | 'ADD_ASSISTANT'
  | 'REMOVE_ASSISTANT'
  | 'CREATE_ORDER'
  | 'UPDATE_ORDER';

export type AuditLogData = {
  action: AuditAction;
  performedBy: string;
  performedByEmail?: string;
  targetResourceId?: string;
  targetResourceType?: 'course' | 'tool' | 'order' | 'user';
  details?: Record<string, any>;
};

/**
 * Create an audit log entry in Firestore
 * 
 * @param data - Audit log data
 * @returns Promise<void>
 * 
 * @example
 * ```typescript
 * await createAuditLog({
 *   action: 'CREATE_COURSE',
 *   performedBy: userId,
 *   performedByEmail: userEmail,
 *   targetResourceId: courseId,
 *   targetResourceType: 'course',
 *   details: {
 *     title: 'Course Name',
 *     price: 100,
 *   },
 * });
 * ```
 */
export async function createAuditLog(data: AuditLogData): Promise<void> {
  try {
    await db.collection('auditLogs').add({
      ...data,
      timestamp: new Date(),
      createdAt: new Date(),
    });

    // Log to console for debugging (can be removed in production)
    console.log(
      `📝 Audit Log: ${data.action} by ${data.performedByEmail || data.performedBy}${
        data.targetResourceId ? ` on ${data.targetResourceType} ${data.targetResourceId}` : ''
      }`
    );
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw error - audit logging failure shouldn't break the main operation
  }
}

/**
 * Query audit logs for a specific resource
 * 
 * @param resourceId - The resource ID to query
 * @param resourceType - The resource type (course, tool, order, user)
 * @returns Promise with audit logs
 */
export async function getAuditLogsForResource(
  resourceId: string,
  resourceType: 'course' | 'tool' | 'order' | 'user'
) {
  try {
    const snapshot = await db
      .collection('auditLogs')
      .where('targetResourceId', '==', resourceId)
      .where('targetResourceType', '==', resourceType)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Query audit logs by user
 * 
 * @param userId - The user ID to query
 * @returns Promise with audit logs
 */
export async function getAuditLogsByUser(userId: string) {
  try {
    const snapshot = await db
      .collection('auditLogs')
      .where('performedBy', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}

/**
 * Get recent audit logs (last 100)
 * 
 * @returns Promise with recent audit logs
 */
export async function getRecentAuditLogs() {
  try {
    const snapshot = await db
      .collection('auditLogs')
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return [];
  }
}
