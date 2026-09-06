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

export async function saveEmailCampaign(input: EmailCampaign): Promise<EmailCampaign> {
  return emailCampaignsStore.save(input);
}
