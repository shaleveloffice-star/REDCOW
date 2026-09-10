import { stripUndefinedDeep } from "@/lib/firebase/serializable";
import { createFirestoreCollectionStore } from "@/lib/firebase/firestore-store";
import { localEmailCampaignsStore } from "@/lib/firebase/local-stores";
import type { EmailCampaign } from "@/types/email-campaign";
import { mutateCollection } from "@/lib/firebase/atomic-collection";

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
  return emailCampaignsStore.save(stripUndefinedDeep(input));
}

export async function claimEmailCampaign(input: EmailCampaign): Promise<{ campaign: EmailCampaign; acquired: boolean }> {
  return mutateCollection<EmailCampaign, { campaign: EmailCampaign; acquired: boolean }>("emailCampaigns", localEmailCampaignsStore, rows => {
    const current = rows.find(row => row.clientRequestId === input.clientRequestId && row.createdByAdmin === input.createdByAdmin);
    if (current && (current.status !== "sending" || !current.leaseExpiresAt || Date.parse(current.leaseExpiresAt) > Date.now())) {
      return { result: { campaign: current, acquired: false } };
    }
    const campaign = current ? { ...current, leaseToken: input.leaseToken, leaseExpiresAt: input.leaseExpiresAt } : input;
    return { result: { campaign, acquired: true }, upserts: [stripUndefinedDeep(campaign)] };
  });
}

export async function checkpointEmailCampaign(input: EmailCampaign): Promise<EmailCampaign> {
  return mutateCollection("emailCampaigns", localEmailCampaignsStore, rows => {
    const current = rows.find(row => row.id === input.id);
    if (!current || current.leaseToken !== input.leaseToken) throw new Error("השליחה מטופלת בבקשה אחרת. רעננו את היסטוריית הדיוור.");
    const saved = stripUndefinedDeep({ ...input, leaseExpiresAt: new Date(Date.now() + 120_000).toISOString() });
    return { result: saved, upserts: [saved] };
  });
}
