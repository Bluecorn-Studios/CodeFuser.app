import fs from "fs";
import path from "path";

export interface FounderNotification {
  id: string;
  type: string;
  projectId: string;
  projectName: string;
  title: string;
  message: string;
  actionLabel: string;
  createdAt: string;
  readAt: string | null;
  severity: "important" | "action_needed";
}

const NOTIFICATIONS_FILE = path.join(process.cwd(), "server", "fuser_notifications.json");

export function getFounderNotifications(): FounderNotification[] {
  try {
    if (fs.existsSync(NOTIFICATIONS_FILE)) {
      const data = fs.readFileSync(NOTIFICATIONS_FILE, "utf-8");
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (err) {
    console.warn("Failed to load founder notifications:", err);
  }
  return [];
}

export function saveFounderNotifications(notifications: FounderNotification[]): void {
  try {
    fs.writeFileSync(NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to save founder notifications:", err);
  }
}

export function addFounderNotification(input: {
  type: string;
  projectId: string;
  projectName: string;
  title: string;
  message: string;
  actionLabel: string;
  severity?: "important" | "action_needed";
}): FounderNotification {
  const notifications = getFounderNotifications();
  const newNotif: FounderNotification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    type: input.type,
    projectId: input.projectId,
    projectName: input.projectName || "Project",
    title: input.title,
    message: input.message,
    actionLabel: input.actionLabel,
    createdAt: new Date().toISOString(),
    readAt: null,
    severity: input.severity || "action_needed"
  };

  // Prevent duplicate spam for same type & project within last 1 hour
  const recentDuplicate = notifications.find(n => 
    n.projectId === input.projectId && 
    n.type === input.type && 
    !n.readAt &&
    (Date.now() - new Date(n.createdAt).getTime() < 3600000)
  );

  if (recentDuplicate) {
    // Update message/timestamp instead of spamming new notification
    recentDuplicate.message = input.message;
    recentDuplicate.createdAt = new Date().toISOString();
    saveFounderNotifications(notifications);
    return recentDuplicate;
  }

  notifications.unshift(newNotif);
  // Keep last 100 notifications
  if (notifications.length > 100) {
    notifications.pop();
  }
  saveFounderNotifications(notifications);
  return newNotif;
}

export function markNotificationRead(id: string): void {
  const notifications = getFounderNotifications();
  const target = notifications.find(n => n.id === id);
  if (target) {
    target.readAt = new Date().toISOString();
    saveFounderNotifications(notifications);
  }
}

export function markAllNotificationsRead(): void {
  const notifications = getFounderNotifications();
  const now = new Date().toISOString();
  notifications.forEach(n => {
    if (!n.readAt) n.readAt = now;
  });
  saveFounderNotifications(notifications);
}

export function clearFounderNotifications(): void {
  saveFounderNotifications([]);
}

export function resolveFounderNotificationsByType(projectId: string, type: string): void {
  const notifications = getFounderNotifications();
  let modified = false;
  notifications.forEach(n => {
    if (n.projectId === projectId && n.type === type && !n.readAt) {
      n.readAt = new Date().toISOString();
      modified = true;
    }
  });
  if (modified) {
    saveFounderNotifications(notifications);
  }
}
