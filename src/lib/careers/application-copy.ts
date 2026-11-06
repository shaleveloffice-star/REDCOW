import type { CareerApplication, RecordStatus } from "@/types/content";

export const CAREER_STATUS_LABELS: Record<RecordStatus, string> = {
  new: "חדש", inReview: "בטיפול", resolved: "טופל", archived: "בארכיון"
};

export function formatCareerApplications(applications: CareerApplication[]): string {
  return applications.map(application => [
    `שם מלא: ${application.fullName}`,
    `טלפון: ${application.phone}`,
    `אזור מגורים: ${application.residenceArea || "לא צוין"}`,
    `גיל: ${application.age ?? "לא צוין"}`,
    `ניסיון קודם: ${application.hasExperience === undefined ? "לא צוין" : application.hasExperience ? "יש ניסיון" : "אין ניסיון"}`,
    application.email ? `אימייל: ${application.email}` : "",
    application.desiredRole ? `תפקיד מבוקש: ${application.desiredRole}` : "",
    application.message ? `הודעה: ${application.message}` : "",
    `סטטוס: ${CAREER_STATUS_LABELS[application.status]}`
  ].filter(Boolean).join("\n")).join("\n\n──────────\n\n");
}
