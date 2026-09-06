import type { ISODateString } from "@/types/content";

export type EmailCampaignStatus = "draft" | "sending" | "completed" | "partial" | "failed";

export type EmailCampaignRecipientSource = "club" | "manual";

export type EmailCampaignRecipientStatus = "pending" | "sent" | "failed" | "skipped";

export type EmailCampaignRecipient = {
  email: string;
  signupId?: string;
  source: EmailCampaignRecipientSource;
  status: EmailCampaignRecipientStatus;
  resendMessageId?: string;
  error?: string;
  sentAt?: ISODateString;
};

export type EmailCampaign = {
  id: string;
  subject: string;
  body: string;
  createdAt: ISODateString;
  sentAt?: ISODateString;
  fromEmail: string;
  fromName: string;
  createdByAdmin: string;
  status: EmailCampaignStatus;
  selectedCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  recipients: EmailCampaignRecipient[];
  /** Client-generated id to prevent double-submit of the same send action. */
  clientRequestId?: string;
};
