import type { CareerApplication, ContactMessage } from "@/types/content";

export const mockContactMessages: ContactMessage[] = [
  {
    id: "message-1",
    fullName: "דניאל כהן",
    phone: "050-1234567",
    email: "daniel@example.com",
    message: "רציתי לשאול על הזמנה לאירוע חברה.",
    createdAt: "2026-05-12T10:30:00.000Z",
    status: "new"
  },
  {
    id: "message-2",
    fullName: "נועה לוי",
    phone: "052-7654321",
    email: "noa@example.com",
    message: "האם יש אפשרות למנה ללא גלוטן?",
    createdAt: "2026-05-14T15:10:00.000Z",
    status: "inReview"
  }
];

export const mockCareerApplications: CareerApplication[] = [
  {
    id: "career-1",
    fullName: "אור בן דוד",
    phone: "054-1112233",
    email: "or@example.com",
    desiredRole: "אחראי משמרת",
    message: "יש לי ניסיון במסעדות ואשמח להצטרף לצוות.",
    createdAt: "2026-05-10T09:15:00.000Z",
    status: "new"
  }
];
