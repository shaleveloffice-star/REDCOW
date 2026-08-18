import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const CONTACT_EMAIL = BUSINESS.email;

export function getPrivacyContentEn(): LegalDocument {
  return {
    lastUpdated: "Last updated: 18 August 2026",
    title: "Privacy Policy - NB BURGER",
    introTitle: "Introduction",
    introBlocks: [
      { type: "paragraph", text: "Welcome to the NB BURGER website." },
      {
        type: "paragraph",
        text: "This policy explains what information is collected on the website, how it is used, and how you can contact us about privacy."
      },
      {
        type: "paragraph",
        text: "The website is used to present information about NB BURGER, including the brand, menu, branch, opening hours, customer club, contact details, and related content."
      },
      {
        type: "paragraph",
        text: "The website itself does not process payments and does not store credit card details. Delivery or pickup orders, when offered on the website, are completed by redirecting to an external ordering system."
      },
      {
        type: "paragraph",
        text: "NB BURGER respects users' privacy and acts in accordance with applicable Israeli law, including the Protection of Privacy Law, 5741-1981."
      },
      {
        type: "paragraph",
        text: "This document is written in the masculine form for convenience only and applies equally to all genders."
      },
      {
        type: "paragraph",
        text: "You are not required to provide personal information. Without certain details, we may be unable to register you for the customer club or contact you."
      },
      {
        type: "paragraph",
        text: 'In this policy, "personal information" means information that can identify a person, directly or indirectly, including name, phone number, date of birth, website usage data, or another identifying detail.'
      }
    ],
    sections: [
      {
        title: "1. Who we are",
        blocks: [
          { type: "paragraph", text: "The website is operated by NB BURGER." },
          {
            type: "list",
            items: [
              `Business name: ${BUSINESS.name}`,
              "Activity: restaurant / food service",
              `Email: ${CONTACT_EMAIL}`,
              `Business address: ${BUSINESS.address.formattedWithCountry.en}`
            ]
          }
        ]
      },
      {
        title: "2. What information is collected",
        blocks: [
          {
            type: "paragraph",
            text: "The information collected depends on how you use the website: browsing only, joining the customer club, or going to an external service."
          }
        ]
      },
      {
        title: "2.1 Customer club",
        blocks: [
          {
            type: "paragraph",
            text: "The customer club is active on the website. When you register, we collect:"
          },
          {
            type: "list",
            items: [
              "Name",
              "Phone number",
              "Date of birth, if provided (optional)",
              "Consent to receive marketing communications"
            ]
          },
          {
            type: "paragraph",
            text: "If provided, date of birth is used for birthday benefits and relevant promotions."
          },
          {
            type: "paragraph",
            text: "Registration details are stored in Firebase / Firestore. An IP address is not stored as part of the customer-club record."
          }
        ]
      },
      {
        title: "2.2 Technical information",
        blocks: [
          {
            type: "paragraph",
            text: "When you browse the website, technical information is collected through Google Analytics 4, including pages viewed, general actions on the site (such as clicking an order option), device and browser type, and referral source where the tool provides it."
          },
          {
            type: "paragraph",
            text: "The server may process an IP address for technical and security purposes, such as rate limiting form submissions. This information is not stored in the customer-club record."
          }
        ]
      },
      {
        title: "2.3 Information we do not collect on the website",
        blocks: [
          {
            type: "paragraph",
            text: "The website itself does not collect or store:"
          },
          {
            type: "list",
            items: [
              "Credit card details",
              "Payment details",
              "National ID numbers",
              "A delivery address within the website itself"
            ]
          },
          {
            type: "paragraph",
            text: "If such information is required by an external ordering system, it is handled by that service under its own terms and privacy policy."
          }
        ]
      },
      {
        title: "3. Purposes of use",
        blocks: [
          {
            type: "paragraph",
            text: "We use the information for the following purposes, depending on the type of information collected:"
          },
          {
            type: "list",
            items: [
              "Operating the customer club",
              "Contacting people who joined the club",
              "Sending updates, benefits, and promotions, subject to consent",
              "Birthday benefits and relevant promotions, if a date of birth was provided",
              "Running the website and saving language preference",
              "Understanding website use through Google Analytics 4",
              "Technical security and preventing abuse, including rate limiting",
              "Responding to privacy inquiries"
            ]
          }
        ]
      },
      {
        title: "4. Consent and marketing communications",
        blocks: [
          {
            type: "paragraph",
            text: "Joining the customer club includes consent to receive marketing communications."
          },
          {
            type: "paragraph",
            text: "NB BURGER may send people who registered and consented marketing messages, updates, benefits, and promotions through channels such as SMS and other channels for which details were provided and consent to receive communications was given."
          },
          {
            type: "paragraph",
            text: "You can opt out of SMS messages using the unsubscribe mechanism that appears in the message, according to the instructions included with it. You may also contact us at the email address at the end of this policy."
          },
          {
            type: "paragraph",
            text: "The website does not currently include an unsubscribe button."
          }
        ]
      },
      {
        title: "5. Orders",
        blocks: [
          {
            type: "paragraph",
            text: "The website itself does not process orders, does not take payment, and does not store credit card details."
          },
          {
            type: "paragraph",
            text: "The website is intended to allow a transfer to an external ordering system for delivery and/or pickup."
          },
          {
            type: "paragraph",
            text: "When an external ordering system is available, clicking an order option may take you to an external service. The rest of the order will also be subject to that provider's privacy policy and terms of use."
          }
        ]
      },
      {
        title: "6. Cookies",
        blocks: [
          {
            type: "paragraph",
            text: "The website uses cookies and similar technologies, as follows:"
          },
          {
            type: "list",
            items: [
              "A cookie for language preference",
              "Google Analytics 4 cookies to measure website use",
              "Technical cookies needed to operate the website, including a session cookie for the admin interface"
            ]
          },
          {
            type: "paragraph",
            text: "When Instagram embedded content is shown, that service may set its own cookies."
          },
          {
            type: "paragraph",
            text: "You can block or delete cookies in your browser settings. Blocking certain cookies may affect language preference or measurement of website use."
          }
        ]
      },
      {
        title: "7. Third-party services",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER does not sell your personal information to third parties."
          },
          {
            type: "paragraph",
            text: "The website uses the following services to operate:"
          },
          {
            type: "list",
            items: [
              "Google Analytics 4 — measuring website use",
              "Firebase / Firestore — storing club registrations and website content",
              "Instagram — displaying embedded social content",
              "Leaflet, CARTO, and OpenStreetMap — displaying the branch map",
              "Google Maps — a navigation link to the branch address",
              "Vercel — hosting the website and media"
            ]
          },
          {
            type: "paragraph",
            text: "These services may process technical information, such as an IP address or device identifiers, in accordance with their own privacy policies."
          },
          {
            type: "paragraph",
            text: "If you go to an external ordering system, use of that system will also be subject to that provider's policy."
          }
        ]
      },
      {
        title: "8. Transfer of information outside Israel",
        blocks: [
          {
            type: "paragraph",
            text: "Some of the services listed above, including hosting, analytics, and media, may be located outside Israel. In those cases, information may be processed outside Israel in accordance with those providers' policies and applicable law."
          }
        ]
      },
      {
        title: "9. Retention period",
        blocks: [
          {
            type: "paragraph",
            text: "We keep personal information for as long as it is needed for the purposes for which it was collected, including operating the customer club, marketing subject to consent, running the website, and responding to inquiries."
          },
          {
            type: "paragraph",
            text: "When the information is no longer needed, we will delete it or limit its use, where reasonably possible."
          }
        ]
      },
      {
        title: "10. Information security",
        blocks: [
          {
            type: "paragraph",
            text: "We take reasonable steps to protect the information, including restricting access to the admin interface and storing club registrations in a secured system."
          },
          {
            type: "paragraph",
            text: "No system is completely secure, and we cannot guarantee full protection against a fault or unauthorized access."
          },
          {
            type: "paragraph",
            text: "NB BURGER will not ask you to send credit card details, passwords, or other sensitive information by email, SMS, or WhatsApp."
          }
        ]
      },
      {
        title: "11. User rights",
        blocks: [
          {
            type: "paragraph",
            text: "Under applicable law, you may have rights in relation to personal information held about you, including access, correction, deletion subject to law, and stopping use of the information for marketing communications."
          },
          {
            type: "paragraph",
            text: `To exercise these rights, contact ${CONTACT_EMAIL}. We may ask for details to verify your identity before responding.`
          }
        ]
      },
      {
        title: "12. Minors",
        blocks: [
          {
            type: "paragraph",
            text: "The website is not intended to collect information from minors without parental or guardian consent, where such consent is required by law."
          },
          {
            type: "paragraph",
            text: "If we learn that information was collected from a minor contrary to law, we will delete it or limit its use."
          }
        ]
      },
      {
        title: "13. External links and services",
        blocks: [
          {
            type: "paragraph",
            text: "The website includes links to social networks, maps, and external services, and may include a transfer to an external ordering system."
          },
          {
            type: "paragraph",
            text: "NB BURGER is not responsible for the privacy policy or practices of external services. You should review each service's policy before submitting details there."
          }
        ]
      },
      {
        title: "14. Changes to this policy",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER may update this policy from time to time. The last-updated date appears at the top of this document."
          }
        ]
      },
      {
        title: "15. Privacy contact",
        blocks: [
          {
            type: "paragraph",
            text: "For questions, requests, or inquiries about this policy, contact us:"
          },
          {
            type: "list",
            items: [
              `Business name: ${BUSINESS.name}`,
              `Email: ${CONTACT_EMAIL}`,
              `Address: ${BUSINESS.address.formattedWithCountry.en}`
            ]
          },
          {
            type: "paragraphWithLink",
            before: "Email for privacy inquiries: ",
            href: `mailto:${CONTACT_EMAIL}`,
            linkText: CONTACT_EMAIL
          }
        ]
      }
    ]
  };
}
