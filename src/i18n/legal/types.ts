export type LegalBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | {
      type: "paragraphWithLink";
      before?: string;
      href: string;
      linkText: string;
      after?: string;
    };

export type LegalSection = {
  title: string;
  blocks: LegalBlock[];
};

export type LegalDocument = {
  lastUpdated: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  introTitle?: string;
  introBlocks: LegalBlock[];
  sections: LegalSection[];
  relatedLink?: {
    prefix: string;
    linkText: string;
    href: string;
  };
};
