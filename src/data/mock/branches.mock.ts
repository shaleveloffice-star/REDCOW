import type { Branch } from "@/types/content";

const now = "2026-05-17T07:00:00.000Z";

export const mockBranches: Branch[] = [
  {
    id: "branch-tel-aviv",
    name: "Red Cow תל אביב",
    city: "תל אביב",
    address: "רחוב הארבעה 12",
    phone: "03-555-1212",
    openingHours: "א-ה 12:00-23:00, ו 11:00-15:00",
    wazeUrl: "https://waze.com/ul?q=Red%20Cow%20Tel%20Aviv",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "branch-rishon",
    name: "Red Cow ראשון לציון",
    city: "ראשון לציון",
    address: "שדרות משה דיין 8",
    phone: "03-555-3434",
    openingHours: "א-ה 12:00-23:30, שבת 19:00-00:00",
    wazeUrl: "https://waze.com/ul?q=Red%20Cow%20Rishon",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];
