import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const CONTACT_EMAIL = BUSINESS.email;

export function getTermsContentEn(): LegalDocument {
  return {
    lastUpdated: "Last updated: 18 August 2026",
    title: "Website Terms and Conditions of Use – NB BURGER",
    introBlocks: [
      {
        type: "paragraph",
        text: 'Welcome to the NB BURGER website (the "Website").'
      },
      {
        type: "paragraph",
        text: "Use of the Website, including browsing, registering for the customer club, submitting details, contacting us, or transferring to an external ordering system, constitutes acceptance of and agreement to these Terms and the Website's Privacy Policy."
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
            text: "The Website is operated and managed by NB BURGER and is used to display information, menus, products, services, promotions, marketing content, the customer club, contact options, and additional services."
          },
          {
            type: "paragraph",
            text: "The Website itself is not an ordering system and does not process orders or payments. The Website enables or will enable a transfer to an external ordering system for delivery and pickup."
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
        title: "3. Information on the Website and images",
        blocks: [
          { type: "paragraph", text: "The Website management makes efforts to display accurate, complete, and up-to-date information." },
          {
            type: "paragraph",
            text: "However, typographical errors, calculation errors, inaccuracies, omissions, or changes may occur."
          },
          {
            type: "paragraph",
            text: "Dish images on the Website are for illustration purposes only. Reasonable differences may exist between the images and the actual appearance of the dish."
          },
          {
            type: "paragraph",
            text: "In the event of an error in a price, description, or other detail displayed on the Website, NB BURGER may correct the information on the Website. The price that applies to an online order is the price shown in the external ordering system at the time the order is placed."
          }
        ]
      },
      {
        title: "4. Orders",
        blocks: [
          {
            type: "paragraph",
            text: "The NB BURGER website itself is not the ordering system and does not process the order or the payment."
          },
          {
            type: "paragraph",
            text: "The Website enables or will enable a transfer to an external ordering system for delivery and pickup."
          },
          {
            type: "paragraph",
            text: "When the user transfers to the external ordering system, placing the order is also subject to the terms and policies of the ordering-system provider."
          }
        ]
      },
      {
        title: "5. Payment",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER does not collect or store credit-card details or order payment details on the Website itself."
          },
          {
            type: "paragraph",
            text: "Payment for an online order is made in the external ordering system."
          }
        ]
      },
      {
        title: "6. Prices",
        blocks: [
          {
            type: "paragraph",
            text: "Prices may be displayed on the NB BURGER website for the purpose of presenting the menu."
          },
          {
            type: "paragraph",
            text: "Prices may change from time to time."
          },
          {
            type: "paragraph",
            text: "When placing an online order, the up-to-date and binding price for the order is the price shown in the external ordering system at the time the order is placed."
          }
        ]
      },
      {
        title: "7. Delivery",
        blocks: [
          {
            type: "paragraph",
            text: "The Website may display general delivery areas."
          },
          {
            type: "paragraph",
            text: "Delivery availability to a specific address, delivery fees, minimum order, delivery times, and other conditions are determined and displayed in the external ordering system at the time of the order."
          }
        ]
      },
      {
        title: "8. Pickup",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER offers a pickup option."
          },
          {
            type: "paragraph",
            text: "Pickup is ordered through the external ordering system when the service is active."
          }
        ]
      },
      {
        title: "9. Dish availability",
        blocks: [
          {
            type: "paragraph",
            text: "Dishes, sides, and products may change or be unavailable from time to time."
          },
          {
            type: "paragraph",
            text: "The availability that applies at the time of an online order is the availability shown in the ordering system."
          }
        ]
      },
      {
        title: "10. Cancellations, changes, and refunds",
        blocks: [
          {
            type: "paragraph",
            text: "Online orders are managed through the external ordering system."
          },
          {
            type: "paragraph",
            text: "Cancellation, change, refund, and other order-related terms will be carried out in accordance with the terms displayed in the relevant ordering system and in accordance with applicable law."
          },
          {
            type: "paragraph",
            text: "Nothing in these Terms shall derogate from consumer rights under any applicable law."
          }
        ]
      },
      {
        title: "11. Kashrut",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER is kosher under the supervision of the Ra'anana Rabbinate."
          }
        ]
      },
      {
        title: "12. Alcoholic beverages",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER sells alcoholic beverages, including beer."
          },
          {
            type: "paragraph",
            text: "The sale of alcoholic beverages is intended for persons aged 18 and over, in accordance with applicable law."
          }
        ]
      },
      {
        title: "13. Allergens and dietary needs",
        blocks: [
          {
            type: "paragraph",
            text: "There is currently no public allergen guide on the Website."
          },
          {
            type: "paragraph",
            text: "Customers with an allergy, sensitivity, or special dietary need are asked to contact the NB BURGER team before placing an order."
          }
        ]
      },
      {
        title: "14. Customer club",
        blocks: [
          {
            type: "paragraph",
            text: "The customer club is active on the Website. Upon registration, the following are collected:"
          },
          {
            type: "list",
            items: [
              "Name",
              "Phone number",
              "Date of birth, if provided (optional field)",
              "Consent to marketing communications"
            ]
          },
          {
            type: "paragraph",
            text: "The date of birth, if provided, is used for birthday benefits and relevant promotions."
          },
          {
            type: "paragraph",
            text: "Further details on the collection and use of this information appear in the Privacy Policy."
          }
        ]
      },
      {
        title: "15. Marketing communications",
        blocks: [
          {
            type: "paragraph",
            text: "Marketing communications are sent to those who have given consent."
          },
          {
            type: "paragraph",
            text: "You can opt out of SMS messages according to the unsubscribe instructions that appear in the message."
          },
          {
            type: "paragraph",
            text: `You may also contact: ${CONTACT_EMAIL}`
          }
        ]
      },
      {
        title: "16. Privacy, cookies, and third-party services",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER operates in accordance with Israeli law regarding privacy protection."
          },
          {
            type: "paragraph",
            text: "The Website itself does not collect or store a delivery address, order details in the ordering system, credit-card details, or payment details. When such information is provided to an external ordering provider, it is handled within that external system."
          },
          {
            type: "paragraph",
            text: "Details about cookies, third-party services, and the use of personal information appear in the Privacy Policy."
          }
        ]
      },
      {
        title: "17. Intellectual property",
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
        title: "18. User responsibility",
        blocks: [
          { type: "paragraph", text: "The user is responsible for providing complete, accurate, and correct information on the Website." },
          {
            type: "paragraph",
            text: "NB BURGER shall not be liable for any damage or delay resulting from incorrect information submitted by the user on the Website."
          }
        ]
      },
      {
        title: "19. Website availability",
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
        title: "20. Force majeure",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER shall not be liable for delay or failure to provide service resulting from war, military operation, state of emergency, force majeure, strike, epidemic, natural disaster, power outage, internet failures, decisions of authorities, or any circumstance beyond its control."
          }
        ]
      },
      {
        title: "21. External links",
        blocks: [
          {
            type: "paragraph",
            text: "The Website may include links to third-party websites and services, including an external ordering system."
          },
          {
            type: "paragraph",
            text: "NB BURGER is not responsible for the content, information, services, or privacy policies of those websites and services."
          }
        ]
      },
      {
        title: "22. Limitation of liability",
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
        title: "23. Reservation of rights",
        blocks: [
          {
            type: "paragraph",
            text: "Failure or delay in exercising any right of NB BURGER under these Terms or under law shall not be deemed a waiver of that right or any other right."
          }
        ]
      },
      {
        title: "24. Severability",
        blocks: [
          {
            type: "paragraph",
            text: "If a competent court determines that any provision of these Terms is invalid, void, or unenforceable, this shall not affect the validity of the remaining provisions, which shall continue in full force and effect."
          }
        ]
      },
      {
        title: "25. Governing law and jurisdiction",
        blocks: [
          { type: "paragraph", text: "These Terms shall be governed exclusively by the laws of the State of Israel." },
          {
            type: "paragraph",
            text: "Any dispute or controversy relating to use of the Website or the services offered therein shall be adjudicated before the competent court in Israel, in accordance with applicable law."
          }
        ]
      },
      {
        title: "26. Contact",
        blocks: [
          { type: "paragraph", text: "NB BURGER" },
          {
            type: "list",
            items: [
              `📍 Address: ${BUSINESS.address.formatted.en}`,
              `📧 Email: ${CONTACT_EMAIL}`
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
