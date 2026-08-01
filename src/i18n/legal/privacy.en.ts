import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

export function getPrivacyContentEn(): LegalDocument {
  return {
    lastUpdated: "Last updated: March 2026",
    title: "Privacy Policy – NB BURGER",
    introTitle: "Introduction",
    introBlocks: [
      { type: "paragraph", text: "Welcome to the NB BURGER website." },
      {
        type: "paragraph",
        text: "This Privacy Policy is intended to clearly explain how NB BURGER collects, stores, uses, and protects personal information provided by users of the website."
      },
      {
        type: "paragraph",
        text: "The website is used to display information about NB BURGER, including information about the brand, menu, branch location, opening hours, updates, contact details, and other content related to the business."
      },
      {
        type: "paragraph",
        text: "At this stage, the website is not used for placing online orders and does not store payment details, credit card information, or users' financial information."
      },
      {
        type: "paragraph",
        text: "The personal information collected on the website is primarily information voluntarily provided by the user, for example through a contact form, updates form, or inquiry submitted via the website."
      },
      {
        type: "paragraph",
        text: "NB BURGER respects the privacy of website users and is committed to acting in accordance with applicable law, including the Protection of Privacy Law, 5741-1981, Amendment 13 to the Protection of Privacy Law, the Communications Law (Telecommunications and Broadcasting), 5742-1982, and any other relevant legislation."
      },
      {
        type: "paragraph",
        text: "This document is written in the masculine form for convenience only and applies equally to all genders."
      },
      {
        type: "paragraph",
        text: "Use of the website or submission of personal details through the website constitutes confirmation that you have read and understood this Privacy Policy. If you do not agree to this policy, please refrain from using the website or submitting personal details."
      },
      {
        type: "paragraph",
        text: "You are not legally required to provide us with personal information. However, without providing certain details, we may be unable to contact you, send updates, or handle an inquiry you submitted through the website."
      },
      {
        type: "paragraph",
        text: 'In this policy, "personal information" means any information relating to an identified or identifiable individual, directly or indirectly, including name, phone number, email address, IP address, website usage data, or any other detail that enables identification of a person with reasonable effort.'
      }
    ],
    sections: [
      {
        title: "1. Who We Are",
        blocks: [
          { type: "paragraph", text: "The website is operated by NB BURGER." },
          {
            type: "paragraph",
            text: "For any privacy-related questions, you may contact us using the contact details at the end of this document."
          },
          {
            type: "list",
            items: [
              `Business name: ${BUSINESS.name}`,
              "Field of activity: Restaurant / burger chain / food services",
              `Email: ${BUSINESS.email}`,
              `Business address: ${BUSINESS.address.formattedWithCountry.en}`
            ]
          }
        ]
      },
      {
        title: "2. What Information We Collect",
        blocks: [
          {
            type: "paragraph",
            text: "When you use the website, we may collect personal information and technical information, depending on how you use the website."
          }
        ]
      },
      {
        title: "2.1 Information You Provide Directly",
        blocks: [
          {
            type: "paragraph",
            text: "We may collect information that you voluntarily provide, including:"
          },
          {
            type: "list",
            items: [
              "Full name",
              "Phone number",
              "Email address, if provided",
              "Message or inquiry content, if submitted",
              "Details provided through an updates form",
              "Details provided through a contact form",
              "Additional information you choose to provide on your own initiative"
            ]
          }
        ]
      },
      {
        title: "2.2 Information Collected Through Contact Forms",
        blocks: [
          {
            type: "paragraph",
            text: "When you submit your details on the website, we may store the following information:"
          },
          {
            type: "list",
            items: [
              "Name",
              "Phone",
              "Email, if included in the form",
              "Date and time of form submission",
              "Website referral source, where identifiable",
              "Inquiry content, if provided",
              "Consent to receive updates and marketing messages, where indicated"
            ]
          },
          {
            type: "paragraph",
            text: "This information will be used to contact you, respond to your inquiry, send updates, marketing messages, and information related to NB BURGER, in accordance with your consent and applicable law."
          }
        ]
      },
      {
        title: "2.3 Technical Information Collected Automatically",
        blocks: [
          {
            type: "paragraph",
            text: "When you use the website, technical information may be collected automatically, including:"
          },
          {
            type: "list",
            items: [
              "IP address",
              "Browser type",
              "Device type",
              "Operating system",
              "Browser language",
              "Pages visited on the website",
              "Time spent on the website",
              "Actions performed on the website",
              "Referral source",
              "General usage data",
              "Performance data, errors, and logs"
            ]
          },
          {
            type: "paragraph",
            text: "This information may be collected through cookies, measurement tools, analytics systems, pixels, tags, and similar technologies."
          }
        ]
      },
      {
        title: "2.4 Information We Do Not Collect on the Website",
        blocks: [
          {
            type: "paragraph",
            text: "At this stage, the website does not collect or store:"
          },
          {
            type: "list",
            items: [
              "Credit card details",
              "Payment information",
              "National ID numbers",
              "Bank account details",
              "Medical information",
              "Biometric information",
              "Online order details",
              "Delivery addresses submitted through the website"
            ]
          },
          {
            type: "paragraph",
            text: "If additional services are added to the website in the future, such as online ordering, a customer club, a payment system, or other services, this Privacy Policy will be updated accordingly."
          }
        ]
      },
      {
        title: "3. Purposes of Use",
        blocks: [
          {
            type: "paragraph",
            text: "Information collected on the website will be used for the following purposes:"
          },
          {
            type: "list",
            items: [
              "Contacting users who submitted their details",
              "Responding to inquiries submitted through the website",
              "Sending updates about NB BURGER",
              "Sending information about openings, menu, promotions, benefits, events, and launches",
              "Managing a mailing list of interested parties",
              "Managing marketing communications, subject to consent",
              "Improving the user experience on the website",
              "Analyzing website activity",
              "Measuring campaign performance",
              "Improving content, design, and services on the website",
              "Targeted advertising and remarketing",
              "Securing the website and preventing misuse",
              "Identifying faults and technical maintenance",
              "Compliance with legal requirements or instructions from authorized authorities",
              "Protecting the rights of NB BURGER, its customers, or third parties"
            ]
          },
          {
            type: "paragraph",
            text: "We may combine information you provide with technical information collected on the website to improve service, tailor content, analyze data, and conduct marketing."
          }
        ]
      },
      {
        title: "4. Submission of Information and Consent",
        blocks: [
          {
            type: "paragraph",
            text: "Submission of personal information on the website is voluntary and based on your consent."
          },
          {
            type: "paragraph",
            text: "When you complete a form on the website and submit your details, you confirm that the information you provided is accurate and that NB BURGER may use it to contact you and handle your inquiry."
          },
          {
            type: "paragraph",
            text: "When you check a box to receive updates or marketing messages, you consent to receiving messages and updates from NB BURGER, including marketing messages, subject to applicable law."
          },
          {
            type: "paragraph",
            text: "You may request at any time to stop receiving marketing messages, as detailed in this policy."
          }
        ]
      },
      {
        title: "5. Disclosure to Third Parties",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER will not sell your personal information to third parties."
          },
          {
            type: "paragraph",
            text: "However, we may transfer personal information or allow access to it by third parties only where necessary to operate the website, manage the business, communicate, conduct marketing, ensure security, or comply with legal requirements."
          },
          {
            type: "paragraph",
            text: "Information may be disclosed to parties such as:"
          },
          {
            type: "list",
            items: [
              "Website hosting and server providers",
              "Cloud service providers",
              "Website development and maintenance providers",
              "CRM systems",
              "Email and automation systems",
              "Digital advertising platforms",
              "Analytics and measurement systems",
              "Information security providers",
              "Customer service and support providers",
              "Professional advisors, including lawyers and accountants",
              "Authorized authorities, where required by law"
            ]
          },
          {
            type: "paragraph",
            text: "Any disclosure of information will be made in accordance with the purposes set out in this policy and in compliance with applicable law."
          }
        ]
      },
      {
        title: "6. Orders and Payments",
        blocks: [
          {
            type: "paragraph",
            text: "At this stage, the website does not allow online ordering and does not store payment details."
          },
          {
            type: "paragraph",
            text: "If an ordering option appears on the website, it may be processed through an external system not directly operated by NB BURGER."
          },
          {
            type: "paragraph",
            text: "In such cases, use of the external system will be subject to that external provider's privacy policy and terms of use."
          },
          {
            type: "paragraph",
            text: "NB BURGER does not store credit card details, payment information, or users' financial information on the website."
          }
        ]
      },
      {
        title: "7. Use of Cookies and Similar Technologies",
        blocks: [
          {
            type: "paragraph",
            text: "The website may use cookies, pixels, tags, and similar technologies."
          },
          {
            type: "paragraph",
            text: "Cookies are small files stored in your browser or device that enable the website to recognize the device, save preferences, measure activity, and improve the user experience."
          },
          {
            type: "paragraph",
            text: "Cookies may be used for the following purposes:"
          },
          {
            type: "list",
            items: [
              "Proper operation of the website",
              "Saving user preferences",
              "Improving speed and browsing experience",
              "Measuring website traffic",
              "Analyzing user behavior",
              "Testing campaign performance",
              "Targeted advertising",
              "Remarketing",
              "Website security",
              "Identifying faults and improving service"
            ]
          },
          {
            type: "paragraph",
            text: "We may use tools such as Google Analytics, Google Tag Manager, Meta Pixel, TikTok Pixel, and similar tools."
          },
          {
            type: "paragraph",
            text: "These tools may collect information about website usage, including pages viewed, actions performed, referral source, device type, and additional usage data."
          },
          {
            type: "paragraph",
            text: "You may block or delete cookies through your browser settings. However, blocking certain cookies may affect some website functions."
          }
        ]
      },
      {
        title: "8. Direct Marketing and Promotional Messages",
        blocks: [
          {
            type: "paragraph",
            text: "If you submitted your details on the website and consented to receive updates, NB BURGER may send you messages and updates through various channels, including:"
          },
          {
            type: "list",
            items: ["SMS", "WhatsApp", "Email", "Phone call", "System messages", "Any other communication channel you provided to us"]
          },
          {
            type: "paragraph",
            text: "These messages may include information about branch opening, menu, promotions, benefits, events, launches, surveys, activities, and other updates."
          },
          {
            type: "paragraph",
            text: "You may request at any time to be removed from the mailing list or to stop receiving marketing messages by contacting us using the details in this policy or through an unsubscribe link, where provided in a message."
          },
          {
            type: "paragraph",
            text: "Please note that even after opting out of marketing communications, we may continue to send service or operational messages that are not promotional, where necessary to handle an inquiry, provide a service, or comply with legal requirements."
          }
        ]
      },
      {
        title: "9. Use of Automation and Artificial Intelligence",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER may use automation systems, CRM systems, data analysis tools, artificial intelligence tools, and chatbots for the following purposes:"
          },
          {
            type: "list",
            items: [
              "Responding to inquiries",
              "Filtering and routing inquiries",
              "Improving customer service",
              "Data analysis",
              "Improving user experience",
              "Tailoring content and offers",
              "Automating marketing and operational processes"
            ]
          },
          {
            type: "paragraph",
            text: "Where a chatbot or automated system is used in interaction with users, we will clarify that it is an automated system, where required by law."
          },
          {
            type: "paragraph",
            text: "NB BURGER will not use automated systems to make significant decisions affecting your rights without the possibility of human review, where required by law."
          }
        ]
      },
      {
        title: "10. Data Retention Period",
        blocks: [
          {
            type: "paragraph",
            text: "We will retain personal information for as long as necessary for the purposes for which it was collected, including:"
          },
          {
            type: "list",
            items: [
              "Contacting you",
              "Handling inquiries",
              "Managing mailing lists",
              "Sending updates",
              "Marketing and communications",
              "Proper business management",
              "Legal compliance",
              "Legal protection",
              "Dispute resolution",
              "Information security"
            ]
          },
          {
            type: "paragraph",
            text: "When information is no longer required, we will take steps to delete, minimize, or anonymize it, where possible and in accordance with applicable law."
          }
        ]
      },
      {
        title: "11. Information Security",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER takes reasonable and accepted measures to protect personal information provided to it, including technological and organizational measures designed to reduce risks of unauthorized access, misuse, loss, alteration, deletion, or unauthorized disclosure."
          },
          {
            type: "paragraph",
            text: "These measures may include, among others:"
          },
          {
            type: "list",
            items: [
              "Use of secure systems",
              "Limited access permissions",
              "Use of passwords and authorization controls",
              "Security measures on the website and servers",
              "Working with providers committed to information security",
              "Monitoring faults and unusual access attempts"
            ]
          },
          {
            type: "paragraph",
            text: "However, it is important to know that no information system is absolutely secure, and we cannot guarantee complete protection against intrusion, malfunction, unauthorized access, or misuse of information."
          },
          {
            type: "paragraph",
            text: "NB BURGER will not ask you to send full credit card details, passwords, or other sensitive information via email, SMS, or WhatsApp."
          }
        ]
      },
      {
        title: "12. User Rights",
        blocks: [
          {
            type: "paragraph",
            text: "In accordance with the Protection of Privacy Law, 5741-1981, and applicable amendments, you may have various rights regarding personal information stored about you, including:"
          },
          {
            type: "list",
            items: [
              "The right to review personal information stored about you",
              "The right to request correction of information that is incorrect, incomplete, unclear, or outdated",
              "The right to request deletion of information, subject to applicable law",
              "The right to request cessation of use of information for direct marketing",
              "The right to request removal from a mailing list",
              "The right to receive information about the purposes of use of information",
              "The right to contact us with any privacy-related question"
            ]
          },
          {
            type: "paragraph",
            text: "To exercise your rights, we may ask you to provide additional details to verify your identity and ensure that information is disclosed to the authorized person."
          },
          {
            type: "paragraph",
            text: "We will review each request in accordance with applicable law and respond within a reasonable time and in accordance with our legal obligations."
          }
        ]
      },
      {
        title: "13. Minors",
        blocks: [
          {
            type: "paragraph",
            text: "The website and digital services are not intended to collect information from minors without parental or guardian consent, where such consent is required by law."
          },
          {
            type: "paragraph",
            text: "If you are a minor, you must obtain approval from your parent or legal guardian before submitting personal details on the website."
          },
          {
            type: "paragraph",
            text: "If we become aware that personal information was collected from a minor contrary to law or without required consent, we will take steps to delete it or limit its use, in accordance with the circumstances and applicable law."
          }
        ]
      },
      {
        title: "14. Links to External Websites and Services",
        blocks: [
          {
            type: "paragraph",
            text: "The website may include links to websites, pages, social networks, external ordering systems, or other external services."
          },
          {
            type: "paragraph",
            text: "NB BURGER is not responsible for the privacy policies, information security, content, or conduct of external websites and services."
          },
          {
            type: "paragraph",
            text: "We recommend reviewing the privacy policy and terms of use of any external service before using it or submitting personal details."
          }
        ]
      },
      {
        title: "15. Transfer of Information Outside Israel",
        blocks: [
          {
            type: "paragraph",
            text: "Some information may be stored or processed through providers located outside Israel, including cloud services, email systems, CRM systems, analytics systems, advertising systems, and other technology providers."
          },
          {
            type: "paragraph",
            text: "In such cases, NB BURGER will act, where required, in accordance with applicable law governing the transfer of information outside Israel."
          }
        ]
      },
      {
        title: "16. Anonymous and Statistical Information",
        blocks: [
          {
            type: "paragraph",
            text: "We may use information that does not personally identify you, including statistical, aggregated, or anonymous information, for the following purposes:"
          },
          {
            type: "list",
            items: [
              "Analyzing website activity",
              "Improving services",
              "Measuring performance",
              "Improving campaigns",
              "Understanding user preferences",
              "Making business decisions"
            ]
          },
          {
            type: "paragraph",
            text: "Information that does not identify a specific person is not considered personal information, and we may use it in accordance with applicable law."
          }
        ]
      },
      {
        title: "17. Surveys, Feedback, and Public Activities",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER may conduct surveys, feedback requests, questionnaires, public activities, preference tests, tastings, promotions, or marketing activities."
          },
          {
            type: "paragraph",
            text: "In the course of such activities, we may collect information such as:"
          },
          {
            type: "list",
            items: [
              "Name",
              "Phone",
              "Survey responses",
              "Food preferences",
              "Comments and feedback",
              "Participation in an activity",
              "Additional information you provide"
            ]
          },
          {
            type: "paragraph",
            text: "This information may be used to improve the menu, understand audience preferences, develop products, conduct marketing, contact you, and provide benefits, subject to your consent and applicable law."
          }
        ]
      },
      {
        title: "18. Changes to This Privacy Policy",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER may update this Privacy Policy from time to time in accordance with changes to the website, services, legal requirements, business needs, or technologies we use."
          },
          {
            type: "paragraph",
            text: "The date of the latest update will appear at the top of the policy."
          },
          {
            type: "paragraph",
            text: "A material change to the policy may be published on the website or in another manner we deem appropriate, where required by law."
          },
          {
            type: "paragraph",
            text: "Continued use of the website after an update to the policy constitutes acceptance of the updated policy."
          }
        ]
      },
      {
        title: "19. Contact Us About Privacy",
        blocks: [
          {
            type: "paragraph",
            text: "For any question, request, complaint, or inquiry regarding this Privacy Policy or the exercise of your rights, you may contact us:"
          },
          {
            type: "list",
            items: [
              `Business name: ${BUSINESS.name}`,
              `Email: ${BUSINESS.email}`,
              `Address: ${BUSINESS.address.formattedWithCountry.en}`
            ]
          },
          {
            type: "paragraph",
            text: "We will review your inquiry and respond in accordance with applicable law."
          }
        ]
      }
    ]
  };
}
