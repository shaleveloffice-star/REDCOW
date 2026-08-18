import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const ACCESSIBILITY_EMAIL = BUSINESS.email;

export function getAccessibilityContentFr(): LegalDocument {
  return {
    lastUpdated: "Dernière mise à jour : 18 août 2026",
    title: "Déclaration d'accessibilité - NB BURGER",
    metaTitle: "Déclaration d'accessibilité | NB BURGER",
    metaDescription:
      "Déclaration d'accessibilité de NB BURGER : aménagements du site, dispositions d'accessibilité du restaurant au 96 Ahuza, Ra'anana, et contact.",
    introTitle: "Notre engagement",
    introBlocks: [
      {
        type: "paragraph",
        text: "NB BURGER s'engage à rendre le site et le restaurant plus faciles à utiliser, et à améliorer l'accessibilité de manière continue."
      },
      {
        type: "paragraph",
        text: "Cette déclaration décrit les aménagements réalisés sur le site et les dispositions d'accessibilité connues du restaurant. Elle n'affirme pas que le site est pleinement accessible ni qu'il est entièrement conforme à la norme israélienne 5568 ou aux WCAG."
      }
    ],
    sections: [
      {
        title: "Aménagements d'accessibilité du site",
        blocks: [
          {
            type: "paragraph",
            text: "Des aménagements techniques d'accessibilité ont été réalisés sur le site, notamment :"
          },
          {
            type: "list",
            items: [
              "Bouton d'accessibilité avec réglages d'affichage (taille du texte, contraste, surlignage des liens et réduction des animations)",
              "Lien d'évitement vers le contenu",
              "Navigation au clavier",
              "États de focus",
              "Textes alternatifs (ALT) pour les images",
              "Libellés et ARIA dans les formulaires",
              "Gestion accessible des dialogues",
              "Possibilité de mettre en pause les vidéos en lecture automatique",
              "Prise en compte de prefers-reduced-motion",
              "Attributs lang et dir",
              "Ajustements du menu mobile"
            ]
          }
        ]
      },
      {
        title: "Dispositions d'accessibilité du restaurant",
        blocks: [
          {
            type: "paragraph",
            text: "Le restaurant se trouve au 96 Ahuza, Ra'anana."
          },
          {
            type: "list",
            items: [
              "Des places de stationnement PMR publiques existent à proximité du restaurant. Il ne s'agit pas de places privées de NB BURGER.",
              "L'entrée du restaurant est accessible en fauteuil roulant.",
              "Des places assises accessibles en fauteuil roulant sont disponibles.",
              "Un comptoir accessible est disponible.",
              "Des toilettes accessibles sont disponibles."
            ]
          }
        ]
      },
      {
        title: "Nous contacter au sujet de l'accessibilité",
        blocks: [
          {
            type: "paragraph",
            text: "Si vous rencontrez un problème d'accessibilité sur le site ou au restaurant, contactez-nous."
          },
          {
            type: "paragraphWithLink",
            before: "E-mail pour les demandes d'accessibilité : ",
            href: `mailto:${ACCESSIBILITY_EMAIL}`,
            linkText: ACCESSIBILITY_EMAIL
          },
          {
            type: "paragraph",
            text: "Dans votre message, merci d'indiquer si possible la nature du problème, la page concernée, ainsi que l'appareil et le navigateur utilisés."
          }
        ]
      },
      {
        title: "Date de mise à jour",
        blocks: [
          {
            type: "paragraph",
            text: "Cette déclaration a été mise à jour le 18 août 2026."
          }
        ]
      }
    ]
  };
}
