import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localEmailCampaignsStore } from "@/lib/firebase/local-stores";
import type { EmailCampaign } from "@/types/email-campaign";

const emailCampaignsStore = createFirestoreCollectionStore(
  "emailCampaigns",
  localEmailCampaignsStore,
  {
    access: "private",
    seed: []
  }
);

export async function getEmailCampaigns(): Promise<EmailCampaign[]> {
  return emailCampaignsStore.getAll();
}

export async function getEmailCampaignById(id: string): Promise<EmailCampaign | null> {
  return emailCampaignsStore.getById(id);
}

function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((item) => stripUndefinedDeep(item)) as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, entry] of Object.entries(value as Record<string, unknown>)) {
      if (entry === undefined) continue;
      out[key] = stripUndefinedDeep(entry);
    }
    return out as T;
  }
  return value;
}

export async function saveEmailCampaign(input: EmailCampaign): Promise<EmailCampaign> {
  return emailCampaignsStore.save(stripUndefinedDeep(input));
}
