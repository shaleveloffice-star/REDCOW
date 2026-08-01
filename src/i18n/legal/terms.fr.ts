import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

export function getTermsContentFr(): LegalDocument {
  return {
    lastUpdated: "Dernière mise à jour : 22/07/2026",
    title: "Conditions générales d'utilisation du site – NB BURGER",
    introBlocks: [
      {
        type: "paragraph",
        text: 'Bienvenue sur le site web de NB BURGER (ci-après le « Site »).'
      },
      {
        type: "paragraph",
        text: "L'utilisation du Site, y compris la navigation, la passation de commande, la prise de contact, l'inscription à un programme de fidélité, la transmission de coordonnées ou l'utilisation de tout service proposé sur le Site, vaut acceptation pleine et entière des présentes conditions et de la politique de confidentialité du Site."
      },
      {
        type: "paragraph",
        text: "Si vous n'acceptez pas les présentes conditions, veuillez vous abstenir d'utiliser le Site."
      }
    ],
    sections: [
      {
        title: "1. Dispositions générales",
        blocks: [
          {
            type: "paragraph",
            text: "Le Site est exploité et géré par NB BURGER et sert à présenter des informations, menus, produits, services, commandes, promotions, contenus marketing, options de contact et services supplémentaires."
          },
          {
            type: "paragraph",
            text: "NB BURGER peut mettre à jour, modifier, supprimer ou ajouter des dispositions aux présentes conditions à tout moment et sans préavis. La version mise à jour publiée sur le Site fera foi."
          },
          {
            type: "paragraph",
            text: "L'utilisation du Site est autorisée uniquement à des fins légales et conformément aux présentes conditions."
          }
        ]
      },
      {
        title: "2. Utilisation du Site",
        blocks: [
          { type: "paragraph", text: "L'utilisateur s'engage à utiliser le Site conformément à la loi applicable uniquement." },
          { type: "paragraph", text: "Il est interdit d'effectuer sur le Site, notamment :" },
          {
            type: "list",
            items: [
              "Une utilisation illégale.",
              "Une tentative d'intrusion dans les systèmes du Site.",
              "Une perturbation du fonctionnement du Site.",
              "L'utilisation de robots, de logiciels automatisés ou d'outils de scan.",
              "La copie, reproduction, distribution ou publication du contenu du Site sans autorisation préalable écrite.",
              "L'usurpation d'identité.",
              "La transmission d'informations fausses.",
              "Toute action susceptible de causer un préjudice au Site, à ses propriétaires ou à d'autres utilisateurs."
            ]
          },
          {
            type: "paragraph",
            text: "NB BURGER peut bloquer l'accès au Site à tout utilisateur ayant enfreint une disposition des présentes conditions ou agi contrairement à la loi."
          }
        ]
      },
      {
        title: "3. Informations sur le Site",
        blocks: [
          { type: "paragraph", text: "La gestion du Site s'efforce de présenter des informations exactes, complètes et à jour." },
          {
            type: "paragraph",
            text: "Toutefois, des erreurs typographiques, des erreurs de calcul, des inexactitudes, des omissions ou des modifications peuvent survenir."
          },
          { type: "paragraph", text: "Les images sur le Site sont fournies à titre illustratif uniquement." },
          { type: "paragraph", text: "Des différences peuvent exister entre les images et le produit réel." },
          {
            type: "paragraph",
            text: "En cas d'erreur manifeste de prix, de description de produit ou de tout autre détail, NB BURGER sera en droit de corriger l'erreur ou d'annuler la commande conformément à la loi applicable."
          }
        ]
      },
      {
        title: "4. Commandes et paiements",
        blocks: [
          {
            type: "paragraph",
            text: "Les prix affichés sur le Site sont exprimés en shekels israéliens et incluent la TVA conformément à la loi, sauf indication contraire."
          },
          { type: "paragraph", text: "NB BURGER peut mettre à jour à tout moment :" },
          {
            type: "list",
            items: ["Les prix", "Les promotions", "Les menus", "Les produits", "Les suppléments", "La disponibilité des produits"]
          },
          { type: "paragraph", text: "L'envoi d'une commande sur le Site ne constitue pas une confirmation définitive de celle-ci." },
          {
            type: "paragraph",
            text: "Une commande sera considérée comme confirmée uniquement après sa réception et son approbation par les systèmes de l'entreprise et sous réserve de la disponibilité des produits."
          },
          { type: "paragraph", text: "NB BURGER peut refuser d'approuver une commande en cas de :" },
          {
            type: "list",
            items: [
              "Rupture de stock.",
              "Erreur de prix.",
              "Suspicion de fraude.",
              "Dysfonctionnement technique.",
              "Transmission de coordonnées incorrectes.",
              "Toute autre raison autorisée par la loi."
            ]
          }
        ]
      },
      {
        title: "5. Livraisons et retrait",
        blocks: [
          { type: "paragraph", text: "Les délais de livraison affichés sur le Site sont des estimations uniquement." },
          { type: "paragraph", text: "Des retards peuvent survenir en raison de :" },
          {
            type: "list",
            items: [
              "Forte affluence.",
              "Conditions météorologiques.",
              "Situation sécuritaire.",
              "Événements de force majeure.",
              "Dysfonctionnements techniques.",
              "Zones de livraison.",
              "Embouteillages."
            ]
          },
          { type: "paragraph", text: "Le client doit fournir une adresse complète et exacte." },
          {
            type: "paragraph",
            text: "NB BURGER ne sera pas responsable des retards ou de l'absence de livraison d'une commande en raison de coordonnées incorrectes."
          }
        ]
      },
      {
        title: "6. Annulations et remboursements",
        blocks: [
          {
            type: "paragraph",
            text: "Une fois la préparation de la commande commencée, l'annulation n'est plus possible, sous réserve de la loi israélienne sur la protection des consommateurs."
          },
          {
            type: "paragraph",
            text: "En cas de problème exceptionnel, vous pouvez contacter le service client et la question sera examinée conformément à la loi applicable."
          },
          {
            type: "paragraph",
            text: "Rien dans les présentes conditions ne porte atteinte aux droits des consommateurs prévus par toute loi applicable."
          }
        ]
      },
      {
        title: "7. Propriété intellectuelle",
        blocks: [
          {
            type: "paragraph",
            text: "Tous les droits de propriété intellectuelle sur le Site appartiennent exclusivement à NB BURGER."
          },
          { type: "paragraph", text: "Notamment :" },
          {
            type: "list",
            items: [
              "Logo",
              "Marques",
              "Images",
              "Vidéos",
              "Design du Site",
              "Code du Site",
              "Textes",
              "Graphismes",
              "Icônes",
              "Documents",
              "Fichiers"
            ]
          },
          {
            type: "paragraph",
            text: "Toute copie, distribution, publication, reproduction, ingénierie inverse ou utilisation commerciale est interdite sans autorisation préalable écrite."
          }
        ]
      },
      {
        title: "8. Confidentialité et sécurité des informations",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER agit conformément à la législation israélienne en matière de protection de la vie privée."
          },
          { type: "paragraph", text: "Le Site peut collecter des informations telles que :" },
          {
            type: "list",
            items: [
              "Nom",
              "Téléphone",
              "Adresse",
              "Adresse e-mail",
              "Détails de commande",
              "Adresse IP",
              "Cookies",
              "Type de navigateur",
              "Données d'utilisation",
              "Informations statistiques"
            ]
          },
          { type: "paragraph", text: "Les informations sont collectées aux fins de :" },
          {
            type: "list",
            items: [
              "Exploitation du Site.",
              "Traitement des commandes.",
              "Service client.",
              "Amélioration du service.",
              "Sécurité des informations.",
              "Prévention de la fraude.",
              "Communication marketing, sous réserve du consentement de l'utilisateur et de la loi applicable."
            ]
          },
          {
            type: "paragraph",
            text: "NB BURGER met en œuvre des mesures de sécurité reconnues et raisonnables, mais ne peut garantir une immunité absolue contre toute intrusion non autorisée dans ses systèmes."
          }
        ]
      },
      {
        title: "9. Cookies",
        blocks: [
          { type: "paragraph", text: "Le Site utilise des cookies aux fins de :" },
          {
            type: "list",
            items: [
              "Exploitation du Site.",
              "Sécurité.",
              "Mesure des performances.",
              "Adaptation de l'expérience utilisateur.",
              "Analyse statistique.",
              "Personnalisation publicitaire."
            ]
          },
          {
            type: "paragraph",
            text: "L'utilisateur peut bloquer les cookies via les paramètres du navigateur ; toutefois, certains services du Site pourraient ne pas fonctionner correctement."
          }
        ]
      },
      {
        title: "10. Systèmes tiers",
        blocks: [
          { type: "paragraph", text: "Le Site peut utiliser des services tiers, notamment :" },
          {
            type: "list",
            items: [
              "Google Analytics",
              "Google Tag Manager",
              "Meta Pixel",
              "Google Ads",
              "Systèmes d'e-mailing",
              "Systèmes de paiement",
              "Systèmes de sécurité",
              "Systèmes d'analyse"
            ]
          },
          {
            type: "paragraph",
            text: "L'utilisation de ces systèmes est également soumise aux politiques de confidentialité de ces sociétés."
          }
        ]
      },
      {
        title: "11. Communications marketing",
        blocks: [
          { type: "paragraph", text: "La transmission de coordonnées sur le Site peut permettre l'envoi de :" },
          {
            type: "list",
            items: ["Promotions", "Coupons", "Actualités", "Nouveautés", "Contenus marketing"]
          },
          {
            type: "paragraph",
            text: "L'utilisateur peut se désinscrire de la liste de diffusion à tout moment conformément à la loi applicable."
          }
        ]
      },
      {
        title: "12. Responsabilité de l'utilisateur",
        blocks: [
          { type: "paragraph", text: "L'utilisateur est responsable de fournir des informations complètes, exactes et correctes." },
          {
            type: "paragraph",
            text: "NB BURGER ne sera pas responsable de tout dommage, retard ou défaut de prestation de service résultant d'informations incorrectes transmises par l'utilisateur."
          }
        ]
      },
      {
        title: "13. Disponibilité du Site",
        blocks: [
          { type: "paragraph", text: "NB BURGER ne garantit pas que le Site sera disponible en continu." },
          { type: "paragraph", text: "Des interruptions peuvent survenir en raison de :" },
          {
            type: "list",
            items: [
              "Maintenance.",
              "Mises à jour.",
              "Dysfonctionnements.",
              "Surcharge des serveurs.",
              "Incidents cyber.",
              "Pannes de communication.",
              "Circonstances indépendantes de la volonté de l'entreprise."
            ]
          }
        ]
      },
      {
        title: "14. Force majeure",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER ne sera pas responsable d'un retard ou d'un défaut de prestation de service résultant d'une guerre, d'une opération militaire, d'un état d'urgence, d'un cas de force majeure, d'une grève, d'une épidémie, d'une catastrophe naturelle, d'une coupure d'électricité, de pannes Internet, de décisions des autorités ou de toute circonstance indépendante de sa volonté."
          }
        ]
      },
      {
        title: "15. Liens externes",
        blocks: [
          {
            type: "paragraph",
            text: "Le Site peut inclure des liens vers des sites web de tiers."
          },
          {
            type: "paragraph",
            text: "NB BURGER n'est pas responsable du contenu, des informations, des services ou des politiques de confidentialité de ces sites."
          }
        ]
      },
      {
        title: "16. Limitation de responsabilité",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER s'efforce de fournir un service de qualité et des informations exactes, mais ne garantit pas que le Site sera exempt de dysfonctionnements ou d'erreurs."
          },
          {
            type: "paragraph",
            text: "Dans la mesure autorisée par la loi, la responsabilité de NB BURGER sera limitée à la responsabilité prévue par la loi uniquement."
          },
          {
            type: "paragraph",
            text: "Rien dans les présentes conditions ne porte atteinte aux droits des consommateurs qui ne peuvent être exclus par la loi."
          }
        ]
      },
      {
        title: "17. Réserve de droits",
        blocks: [
          {
            type: "paragraph",
            text: "Le non-exercice ou le retard dans l'exercice d'un droit quelconque de NB BURGER en vertu des présentes conditions ou de la loi ne saurait être interprété comme une renonciation à ce droit ou à tout autre droit."
          }
        ]
      },
      {
        title: "18. Divisibilité",
        blocks: [
          {
            type: "paragraph",
            text: "Si un tribunal compétent détermine qu'une disposition des présentes conditions est invalide, nulle ou inapplicable, cela n'affectera pas la validité des autres dispositions, qui continueront de produire leurs effets intégralement."
          }
        ]
      },
      {
        title: "19. Droit applicable et juridiction",
        blocks: [
          { type: "paragraph", text: "Les présentes conditions sont régies exclusivement par le droit de l'État d'Israël." },
          {
            type: "paragraph",
            text: "Tout litige ou différend relatif à l'utilisation du Site ou aux services qui y sont proposés sera tranché par le tribunal compétent en Israël, conformément à la loi applicable."
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
              `📍 Adresse : ${BUSINESS.address.formattedWithCountry.fr}`,
              `📧 E-mail : ${BUSINESS.email}`
            ]
          }
        ]
      }
    ],
    relatedLink: {
      prefix: "Pour plus de détails sur la collecte et l'utilisation des informations personnelles, consultez également notre",
      linkText: "politique de confidentialité",
      href: "/privacy-policy"
    }
  };
}
