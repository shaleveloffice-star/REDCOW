import type { Branch } from "@/types/content";
import { BUSINESS, getBusinessMapsSearchUrl } from "@/data/business";

const now = "2026-05-17T07:00:00.000Z";

export const mockBranches: Branch[] = [
  {
    id: "branch-raanana",
    name: `${BUSINESS.name} ${BUSINESS.address.addressLocality}`,
    city: BUSINESS.address.addressLocality,
    address: BUSINESS.address.streetAddress,
    phone: "",
    openingHours: `א׳–ה׳ ${BUSINESS.displayHours.weekday} · שבת ${BUSINESS.displayHours.saturday}`,
    wazeUrl: getBusinessMapsSearchUrl(),
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];
