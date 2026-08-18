import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const CONTACT_EMAIL = BUSINESS.email;

export function getTermsContentFr(): LegalDocument {
  return {
    lastUpdated: "Dernière mise à jour : 18 août 2026",
    title: "Conditions générales d'utilisation du site – NB BURGER",
    introBlocks: [
      {
        type: "paragraph",
        text: 'Bienvenue sur le site web de NB BURGER (ci-après le « Site »).'
      },
      {
        type: "paragraph",
        text: "L'utilisation du Site, y compris la navigation, l'inscription au club clients, la transmission de coordonnées, la prise de contact ou le transfert vers un système de commande externe, vaut acceptation des présentes conditions et de la politique de confidentialité du Site."
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
            text: "Le Site est exploité et géré par NB BURGER et sert à présenter des informations, menus, produits, services, promotions, contenus marketing, le club clients, des options de contact et des services supplémentaires."
          },
          {
            type: "paragraph",
            text: "Le Site lui-même n'est pas un système de commande et ne traite ni les commandes ni les paiements. Le Site permet ou permettra un transfert vers un système de commande externe pour la livraison et le retrait."
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
        title: "3. Informations sur le Site et images",
        blocks: [
          { type: "paragraph", text: "La gestion du Site s'efforce de présenter des informations exactes, complètes et à jour." },
          {
            type: "paragraph",
            text: "Toutefois, des erreurs typographiques, des erreurs de calcul, des inexactitudes, des omissions ou des modifications peuvent survenir."
          },
          {
            type: "paragraph",
            text: "Les images des plats sur le Site sont fournies à titre illustratif uniquement. Des différences raisonnables peuvent exister entre les images et l'apparence réelle du plat."
          },
          {
            type: "paragraph",
            text: "En cas d'erreur de prix, de description ou de tout autre détail affiché sur le Site, NB BURGER peut corriger les informations sur le Site. Le prix applicable à une commande en ligne est le prix affiché dans le système de commande externe au moment de la commande."
          }
        ]
      },
      {
        title: "4. Commandes",
        blocks: [
          {
            type: "paragraph",
            text: "Le site de NB BURGER lui-même n'est pas le système de commande et ne traite ni la commande ni le paiement."
          },
          {
            type: "paragraph",
            text: "Le Site permet ou permettra un transfert vers un système de commande externe pour la livraison et le retrait."
          },
          {
            type: "paragraph",
            text: "Lorsque l'utilisateur est transféré vers le système de commande externe, la passation de la commande est également soumise aux conditions et à la politique du fournisseur du système de commande."
          }
        ]
      },
      {
        title: "5. Paiement",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER ne collecte ni ne conserve sur le Site lui-même les données de carte bancaire ni les données de paiement de la commande."
          },
          {
            type: "paragraph",
            text: "Le paiement d'une commande en ligne s'effectue dans le système de commande externe."
          }
        ]
      },
      {
        title: "6. Prix",
        blocks: [
          {
            type: "paragraph",
            text: "Des prix peuvent être affichés sur le site de NB BURGER aux fins de présentation du menu."
          },
          {
            type: "paragraph",
            text: "Les prix peuvent changer de temps à autre."
          },
          {
            type: "paragraph",
            text: "Lors d'une commande en ligne, le prix à jour et déterminant pour la commande est le prix affiché dans le système de commande externe au moment de la commande."
          }
        ]
      },
      {
        title: "7. Livraisons",
        blocks: [
          {
            type: "paragraph",
            text: "Le Site peut afficher des zones de livraison générales."
          },
          {
            type: "paragraph",
            text: "La disponibilité de la livraison à une adresse donnée, les frais de livraison, le minimum de commande, les délais de livraison et les autres conditions sont déterminés et affichés dans le système de commande externe au moment de la commande."
          }
        ]
      },
      {
        title: "8. Retrait",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER propose une option de retrait."
          },
          {
            type: "paragraph",
            text: "Le retrait est commandé via le système de commande externe lorsque le service est actif."
          }
        ]
      },
      {
        title: "9. Disponibilité des plats",
        blocks: [
          {
            type: "paragraph",
            text: "Les plats, accompagnements et produits peuvent changer ou être indisponibles de temps à autre."
          },
          {
            type: "paragraph",
            text: "La disponibilité déterminante au moment d'une commande en ligne est celle affichée dans le système de commande."
          }
        ]
      },
      {
        title: "10. Annulations, modifications et remboursements",
        blocks: [
          {
            type: "paragraph",
            text: "Les commandes en ligne sont gérées via le système de commande externe."
          },
          {
            type: "paragraph",
            text: "L'annulation, la modification, le remboursement et les conditions liées à la commande s'effectuent conformément aux conditions affichées dans le système de commande concerné et conformément à la loi applicable."
          },
          {
            type: "paragraph",
            text: "Rien dans les présentes conditions ne porte atteinte aux droits des consommateurs prévus par toute loi applicable."
          }
        ]
      },
      {
        title: "11. Cacherout",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER est casher sous la supervision du rabbinat de Ra'anana."
          }
        ]
      },
      {
        title: "12. Boissons alcoolisées",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER vend des boissons alcoolisées, notamment de la bière."
          },
          {
            type: "paragraph",
            text: "La vente de boissons alcoolisées est destinée aux personnes âgées de 18 ans et plus, conformément à la loi applicable."
          }
        ]
      },
      {
        title: "13. Allergènes et besoins alimentaires",
        blocks: [
          {
            type: "paragraph",
            text: "Il n'existe actuellement aucun guide public des allergènes sur le Site."
          },
          {
            type: "paragraph",
            text: "Les clients présentant une allergie, une sensibilité ou un besoin alimentaire particulier sont priés de contacter l'équipe NB BURGER avant de passer commande."
          }
        ]
      },
      {
        title: "14. Club clients",
        blocks: [
          {
            type: "paragraph",
            text: "Le club clients est actif sur le Site. Lors de l'inscription, les informations suivantes sont collectées :"
          },
          {
            type: "list",
            items: [
              "Nom",
              "Numéro de téléphone",
              "Date de naissance, si elle est fournie (champ facultatif)",
              "Consentement aux communications marketing"
            ]
          },
          {
            type: "paragraph",
            text: "La date de naissance, si elle est fournie, est utilisée pour des avantages d'anniversaire et des promotions pertinentes."
          },
          {
            type: "paragraph",
            text: "De plus amples détails sur la collecte et l'utilisation de ces informations figurent dans la politique de confidentialité."
          }
        ]
      },
      {
        title: "15. Communications marketing",
        blocks: [
          {
            type: "paragraph",
            text: "Les communications marketing sont envoyées aux personnes ayant donné leur consentement."
          },
          {
            type: "paragraph",
            text: "La désinscription des SMS est possible conformément aux instructions de désinscription figurant dans le message."
          },
          {
            type: "paragraph",
            text: `Vous pouvez également contacter : ${CONTACT_EMAIL}`
          }
        ]
      },
      {
        title: "16. Confidentialité, cookies et services tiers",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER agit conformément à la législation israélienne en matière de protection de la vie privée."
          },
          {
            type: "paragraph",
            text: "Le Site lui-même ne collecte ni ne conserve d'adresse de livraison, de détails de commande dans le système de commande, de données de carte bancaire ou de données de paiement. Lorsque de telles informations sont transmises à un fournisseur de commande externe, elles sont traitées dans le cadre de ce système externe."
          },
          {
            type: "paragraph",
            text: "Les détails concernant les cookies, les services tiers et l'utilisation des informations personnelles figurent dans la politique de confidentialité."
          }
        ]
      },
      {
        title: "17. Propriété intellectuelle",
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
        title: "18. Responsabilité de l'utilisateur",
        blocks: [
          { type: "paragraph", text: "L'utilisateur est responsable de fournir des informations complètes, exactes et correctes sur le Site." },
          {
            type: "paragraph",
            text: "NB BURGER ne sera pas responsable de tout dommage ou retard résultant d'informations incorrectes transmises par l'utilisateur sur le Site."
          }
        ]
      },
      {
        title: "19. Disponibilité du Site",
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
        title: "20. Force majeure",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER ne sera pas responsable d'un retard ou d'un défaut de prestation de service résultant d'une guerre, d'une opération militaire, d'un état d'urgence, d'un cas de force majeure, d'une grève, d'une épidémie, d'une catastrophe naturelle, d'une coupure d'électricité, de pannes Internet, de décisions des autorités ou de toute circonstance indépendante de sa volonté."
          }
        ]
      },
      {
        title: "21. Liens externes",
        blocks: [
          {
            type: "paragraph",
            text: "Le Site peut inclure des liens vers des sites web et des services de tiers, y compris un système de commande externe."
          },
          {
            type: "paragraph",
            text: "NB BURGER n'est pas responsable du contenu, des informations, des services ou des politiques de confidentialité de ces sites et services."
          }
        ]
      },
      {
        title: "22. Limitation de responsabilité",
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
        title: "23. Réserve de droits",
        blocks: [
          {
            type: "paragraph",
            text: "Le non-exercice ou le retard dans l'exercice d'un droit quelconque de NB BURGER en vertu des présentes conditions ou de la loi ne saurait être interprété comme une renonciation à ce droit ou à tout autre droit."
          }
        ]
      },
      {
        title: "24. Divisibilité",
        blocks: [
          {
            type: "paragraph",
            text: "Si un tribunal compétent détermine qu'une disposition des présentes conditions est invalide, nulle ou inapplicable, cela n'affectera pas la validité des autres dispositions, qui continueront de produire leurs effets intégralement."
          }
        ]
      },
      {
        title: "25. Droit applicable et juridiction",
        blocks: [
          { type: "paragraph", text: "Les présentes conditions sont régies exclusivement par le droit de l'État d'Israël." },
          {
            type: "paragraph",
            text: "Tout litige ou différend relatif à l'utilisation du Site ou aux services qui y sont proposés sera tranché par le tribunal compétent en Israël, conformément à la loi applicable."
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
              `📍 Adresse : ${BUSINESS.address.formatted.fr}`,
              `📧 E-mail : ${CONTACT_EMAIL}`
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
