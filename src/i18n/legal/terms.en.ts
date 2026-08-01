import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

export function getTermsContentEn(): LegalDocument {
  return {
    lastUpdated: "Last updated: 22/07/2026",
    title: "Website Terms and Conditions of Use – NB BURGER",
    introBlocks: [
      {
        type: "paragraph",
        text: 'Welcome to the NB BURGER website (the "Website").'
      },
      {
        type: "paragraph",
        text: "Use of the Website, including browsing, placing an order, contacting us, registering for a customer club, submitting details, or using any service offered on the Website, constitutes full acceptance of and agreement to these Terms and the Website's Privacy Policy."
      },
      {
        type: "paragraph",
        text: "If you do not agree to these Terms, you are requested to refrain from using the Website."
      }
    ],
    sections: [
      {
        title: "1. General",
        blocks: [
          {
            type: "paragraph",
            text: "The Website is operated and managed by NB BURGER and is used to display information, menus, products, services, orders, promotions, marketing content, contact options, and additional services."
          },
          {
            type: "paragraph",
            text: "NB BURGER may update, modify, delete, or add provisions to these Terms at any time without prior notice. The updated version published on the Website shall be the binding version."
          },
          {
            type: "paragraph",
            text: "Use of the Website is permitted for lawful purposes only and in accordance with these Terms."
          }
        ]
      },
      {
        title: "2. Use of the Website",
        blocks: [
          { type: "paragraph", text: "The user undertakes to use the Website in accordance with applicable law only." },
          { type: "paragraph", text: "It is prohibited to engage in the following on the Website, including but not limited to:" },
          {
            type: "list",
            items: [
              "Unlawful use.",
              "Attempting to penetrate the Website's systems.",
              "Disrupting the operation of the Website.",
              "Operating robots, automated software, or scanning tools.",
              "Copying, reproducing, distributing, or publishing Website content without prior written approval.",
              "Impersonating another person.",
              "Submitting false information.",
              "Any action that may cause harm to the Website, its owners, or other users."
            ]
          },
          {
            type: "paragraph",
            text: "NB BURGER may block access to the Website from any user who violates a provision of these Terms or acts contrary to law."
          }
        ]
      },
      {
        title: "3. Information on the Website",
        blocks: [
          { type: "paragraph", text: "The Website management makes efforts to display accurate, complete, and up-to-date information." },
          {
            type: "paragraph",
            text: "However, typographical errors, calculation errors, inaccuracies, omissions, or changes may occur."
          },
          { type: "paragraph", text: "Images on the Website are for illustration purposes only." },
          { type: "paragraph", text: "Differences may exist between the images and the actual product." },
          {
            type: "paragraph",
            text: "In the event of a clear error in price, product description, or any other detail, NB BURGER shall be entitled to correct the error or cancel the order in accordance with applicable law."
          }
        ]
      },
      {
        title: "4. Orders and Payments",
        blocks: [
          {
            type: "paragraph",
            text: "Prices displayed on the Website are shown in New Israeli Shekels and include VAT as required by law, unless otherwise stated."
          },
          { type: "paragraph", text: "NB BURGER may update at any time:" },
          {
            type: "list",
            items: ["Prices", "Promotions", "Menus", "Products", "Add-ons", "Product availability"]
          },
          { type: "paragraph", text: "Submitting an order on the Website does not constitute final confirmation of the order." },
          {
            type: "paragraph",
            text: "An order shall be considered confirmed only after it is received and approved by the business systems and subject to product availability."
          },
          { type: "paragraph", text: "NB BURGER may decline to approve an order in cases of:" },
          {
            type: "list",
            items: [
              "Out of stock.",
              "Pricing error.",
              "Suspected fraud.",
              "Technical malfunction.",
              "Submission of incorrect details.",
              "Any other reason permitted by law."
            ]
          }
        ]
      },
      {
        title: "5. Deliveries and Pickup",
        blocks: [
          { type: "paragraph", text: "Delivery times displayed on the Website are estimates only." },
          { type: "paragraph", text: "Delays may occur due to:" },
          {
            type: "list",
            items: [
              "High demand.",
              "Weather conditions.",
              "Security situation.",
              "Force majeure events.",
              "Technical malfunctions.",
              "Delivery zones.",
              "Traffic congestion."
            ]
          },
          { type: "paragraph", text: "The customer must provide a complete and accurate address." },
          {
            type: "paragraph",
            text: "NB BURGER shall not be liable for delays or failure to deliver an order due to submission of incorrect details."
          }
        ]
      },
      {
        title: "6. Cancellations and Refunds",
        blocks: [
          {
            type: "paragraph",
            text: "Once order preparation has begun, cancellation is not possible, subject to the Consumer Protection Law."
          },
          {
            type: "paragraph",
            text: "In any exceptional issue, you may contact customer service and the matter will be reviewed in accordance with applicable law."
          },
          {
            type: "paragraph",
            text: "Nothing in these Terms shall derogate from consumer rights under any applicable law."
          }
        ]
      },
      {
        title: "7. Intellectual Property",
        blocks: [
          {
            type: "paragraph",
            text: "All intellectual property rights in the Website belong exclusively to NB BURGER."
          },
          { type: "paragraph", text: "Including:" },
          {
            type: "list",
            items: [
              "Logo",
              "Trademarks",
              "Images",
              "Videos",
              "Website design",
              "Website code",
              "Texts",
              "Graphics",
              "Icons",
              "Documents",
              "Files"
            ]
          },
          {
            type: "paragraph",
            text: "No copying, distribution, publication, reproduction, reverse engineering, or commercial use is permitted without prior written approval."
          }
        ]
      },
      {
        title: "8. Privacy and Information Security",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER operates in accordance with Israeli law regarding privacy protection."
          },
          { type: "paragraph", text: "The Website may collect information such as:" },
          {
            type: "list",
            items: [
              "Name",
              "Phone",
              "Address",
              "Email address",
              "Order details",
              "IP address",
              "Cookies",
              "Browser type",
              "Usage data",
              "Statistical information"
            ]
          },
          { type: "paragraph", text: "Information is collected for the purpose of:" },
          {
            type: "list",
            items: [
              "Operating the Website.",
              "Processing orders.",
              "Customer service.",
              "Improving service.",
              "Information security.",
              "Fraud prevention.",
              "Marketing communications, subject to user consent and applicable law."
            ]
          },
          {
            type: "paragraph",
            text: "NB BURGER implements accepted and reasonable information security measures but cannot guarantee absolute immunity against unauthorized intrusion into its systems."
          }
        ]
      },
      {
        title: "9. Cookies",
        blocks: [
          { type: "paragraph", text: "The Website uses cookies for the purpose of:" },
          {
            type: "list",
            items: [
              "Operating the Website.",
              "Security.",
              "Performance measurement.",
              "Tailoring the user experience.",
              "Statistical analysis.",
              "Advertising personalization."
            ]
          },
          {
            type: "paragraph",
            text: "The user may block cookies through browser settings; however, some Website services may not function properly."
          }
        ]
      },
      {
        title: "10. Third-Party Systems",
        blocks: [
          { type: "paragraph", text: "The Website may use third-party services, including:" },
          {
            type: "list",
            items: [
              "Google Analytics",
              "Google Tag Manager",
              "Meta Pixel",
              "Google Ads",
              "Email systems",
              "Payment processing systems",
              "Security systems",
              "Analytics systems"
            ]
          },
          {
            type: "paragraph",
            text: "Use of these systems is also subject to the privacy policies of those companies."
          }
        ]
      },
      {
        title: "11. Marketing Communications",
        blocks: [
          { type: "paragraph", text: "Submitting details on the Website may enable sending of:" },
          {
            type: "list",
            items: ["Promotions", "Coupons", "Updates", "News", "Marketing content"]
          },
          {
            type: "paragraph",
            text: "The user may unsubscribe from the mailing list at any time in accordance with applicable law."
          }
        ]
      },
      {
        title: "12. User Responsibility",
        blocks: [
          { type: "paragraph", text: "The user is responsible for providing complete, accurate, and correct information." },
          {
            type: "paragraph",
            text: "NB BURGER shall not be liable for any damage, delay, or failure to provide service resulting from incorrect information submitted by the user."
          }
        ]
      },
      {
        title: "13. Website Availability",
        blocks: [
          { type: "paragraph", text: "NB BURGER does not guarantee that the Website will be available continuously." },
          { type: "paragraph", text: "Interruptions may occur due to:" },
          {
            type: "list",
            items: [
              "Maintenance.",
              "Updates.",
              "Malfunctions.",
              "Server overload.",
              "Cyber incidents.",
              "Communication failures.",
              "Circumstances beyond the business's control."
            ]
          }
        ]
      },
      {
        title: "14. Force Majeure",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER shall not be liable for delay or failure to provide service resulting from war, military operation, state of emergency, force majeure, strike, epidemic, natural disaster, power outage, internet failures, decisions of authorities, or any circumstance beyond its control."
          }
        ]
      },
      {
        title: "15. External Links",
        blocks: [
          {
            type: "paragraph",
            text: "The Website may include links to third-party websites."
          },
          {
            type: "paragraph",
            text: "NB BURGER is not responsible for the content, information, services, or privacy policies of those websites."
          }
        ]
      },
      {
        title: "16. Limitation of Liability",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER makes efforts to provide quality service and accurate information but does not guarantee that the Website will be free of malfunctions or errors."
          },
          {
            type: "paragraph",
            text: "To the extent permitted by law, NB BURGER's liability shall be limited to the liability prescribed by law only."
          },
          {
            type: "paragraph",
            text: "Nothing in these Terms shall derogate from consumer rights that cannot be waived under law."
          }
        ]
      },
      {
        title: "17. Reservation of Rights",
        blocks: [
          {
            type: "paragraph",
            text: "Failure or delay in exercising any right of NB BURGER under these Terms or under law shall not be deemed a waiver of that right or any other right."
          }
        ]
      },
      {
        title: "18. Severability",
        blocks: [
          {
            type: "paragraph",
            text: "If a competent court determines that any provision of these Terms is invalid, void, or unenforceable, this shall not affect the validity of the remaining provisions, which shall continue in full force and effect."
          }
        ]
      },
      {
        title: "19. Governing Law and Jurisdiction",
        blocks: [
          { type: "paragraph", text: "These Terms shall be governed exclusively by the laws of the State of Israel." },
          {
            type: "paragraph",
            text: "Any dispute or controversy relating to use of the Website or the services offered therein shall be adjudicated before the competent court in Israel, in accordance with applicable law."
          }
        ]
      },
      {
        title: "20. Contact",
        blocks: [
          { type: "paragraph", text: "NB BURGER" },
          {
            type: "list",
            items: [
              `📍 Address: ${BUSINESS.address.formattedWithCountry.en}`,
              `📧 Email: ${BUSINESS.email}`
            ]
          }
        ]
      }
    ],
    relatedLink: {
      prefix: "For further details on the collection and use of personal information, see also our",
      linkText: "Privacy Policy",
      href: "/privacy-policy"
    }
  };
}
