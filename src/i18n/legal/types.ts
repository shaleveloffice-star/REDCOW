export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  lastUpdated: string;
  title: string;
  introTitle?: string;
  introBlocks: LegalBlock[];
  sections: LegalSection[];
  relatedLink?: {
    prefix: string;
    linkText: string;
    href: string;
  };
};
