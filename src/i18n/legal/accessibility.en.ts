import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const ACCESSIBILITY_EMAIL = BUSINESS.email;

export function getAccessibilityContentEn(): LegalDocument {
  return {
    lastUpdated: "Last updated: 18 August 2026",
    title: "Accessibility Statement - NB BURGER",
    metaTitle: "Accessibility Statement | NB BURGER",
    metaDescription:
      "NB BURGER accessibility statement: website accessibility adjustments, arrangements at the Ahuza 96, Ra'anana branch, and how to contact us about accessibility.",
    introTitle: "Our commitment",
    introBlocks: [
      {
        type: "paragraph",
        text: "NB BURGER is committed to making the website and branch easier to use, and to improving accessibility over time."
      },
      {
        type: "paragraph",
        text: "This statement describes accessibility adjustments made on the website and the known accessibility arrangements at the branch. It does not claim that the website is fully accessible or that it fully conforms to Israeli Standard 5568 or WCAG."
      }
    ],
    sections: [
      {
        title: "Website accessibility adjustments",
        blocks: [
          {
            type: "paragraph",
            text: "Technical accessibility adjustments have been made on the website, including:"
          },
          {
            type: "list",
            items: [
              "Accessibility button with display adjustments (text size, contrast, link highlighting, and reduced motion)",
              "Skip-to-content link",
              "Keyboard navigation support",
              "Focus states",
              "ALT text for images",
              "Form labels and ARIA",
              "Accessible handling of dialogs",
              "A way to pause autoplay videos",
              "Support for prefers-reduced-motion",
              "lang and dir attributes",
              "Mobile menu adjustments"
            ]
          }
        ]
      },
      {
        title: "Branch accessibility arrangements",
        blocks: [
          {
            type: "paragraph",
            text: "The branch is at Ahuza 96, Ra'anana."
          },
          {
            type: "list",
            items: [
              "There are public accessible parking spaces near the branch. These are not private parking spaces of NB BURGER.",
              "The branch entrance is wheelchair accessible.",
              "Wheelchair-accessible seating is available.",
              "An accessible counter is available.",
              "An accessible restroom is available."
            ]
          }
        ]
      },
      {
        title: "Contacting us about accessibility",
        blocks: [
          {
            type: "paragraph",
            text: "If you encounter an accessibility issue on the website or at the branch, please contact us."
          },
          {
            type: "paragraphWithLink",
            before: "Accessibility contact email: ",
            href: `mailto:${ACCESSIBILITY_EMAIL}`,
            linkText: ACCESSIBILITY_EMAIL
          },
          {
            type: "paragraph",
            text: "When you write, please include, if possible, what the issue is, which page it appeared on, and which device and browser you used."
          }
        ]
      },
      {
        title: "Last updated",
        blocks: [
          {
            type: "paragraph",
            text: "This statement was last updated on 18 August 2026."
          }
        ]
      }
    ]
  };
}
