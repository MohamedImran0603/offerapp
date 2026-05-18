import { db } from "./firebase";
import { collection, addDoc } from "firebase/firestore";

interface AuditLogParams {
  adminId: string;
  adminEmail: string;
  role: string;
  action: "CREATE_OFFER" | "DELETE_OFFER" | "APPROVE_OFFER" | "SUSPEND_USER" | "UPDATE_ROLE";
  targetId: string;
  details: string;
}

/**
 * Standardized global activity logging utility for admins.
 * Automatically inserts logs into Firestore /auditLogs
 */
export async function logAdminActivity({
  adminId,
  adminEmail,
  role,
  action,
  targetId,
  details
}: AuditLogParams) {
  try {
    const auditLogsRef = collection(db, "auditLogs");

    // Fetch browser client details safely on client-side runs
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "Server Node context";
    const ipAddress = "10.50.119.16"; // Uniform local/development loopback

    const logEntry = {
      adminId,
      adminEmail,
      role,
      action,
      targetId,
      details,
      ipAddress,
      deviceInfo: userAgent.substring(0, 150),
      timestamp: new Date().toISOString()
    };

    await addDoc(auditLogsRef, logEntry);
    console.log(`✅ Audit Log recorded successfully: [${action}] by ${adminEmail}`);
  } catch (error) {
    console.error("❌ Failed to register admin audit log in Firestore:", error);
  }
}
