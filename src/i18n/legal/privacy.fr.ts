import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

const CONTACT_EMAIL = BUSINESS.email;

export function getPrivacyContentFr(): LegalDocument {
  return {
    lastUpdated: "Dernière mise à jour : 18 août 2026",
    title: "Politique de confidentialité - NB BURGER",
    introTitle: "Introduction",
    introBlocks: [
      { type: "paragraph", text: "Bienvenue sur le site de NB BURGER." },
      {
        type: "paragraph",
        text: "La présente politique explique quelles informations sont collectées sur le site, comment elles sont utilisées et comment nous contacter au sujet de la confidentialité."
      },
      {
        type: "paragraph",
        text: "Le site sert à présenter des informations sur NB BURGER, notamment la marque, le menu, l'établissement, les horaires, le club clients, les coordonnées et d'autres contenus."
      },
      {
        type: "paragraph",
        text: "Le site lui-même n'effectue pas de paiement et ne conserve pas de données de carte bancaire. Une commande en livraison ou à emporter, lorsqu'elle est proposée sur le site, s'effectue par redirection vers un système de commande externe."
      },
      {
        type: "paragraph",
        text: "NB BURGER respecte la vie privée des utilisateurs et agit conformément au droit israélien applicable, notamment la loi sur la protection de la vie privée de 1981."
      },
      {
        type: "paragraph",
        text: "Le présent document est rédigé au masculin pour des raisons de commodité uniquement et s'applique à tous les genres."
      },
      {
        type: "paragraph",
        text: "Vous n'êtes pas tenu de fournir des informations personnelles. Sans certaines données, nous pourrions ne pas pouvoir vous inscrire au club clients ni vous contacter."
      },
      {
        type: "paragraph",
        text: "Dans la présente politique, une « information personnelle » désigne une information permettant d'identifier une personne, directement ou indirectement, y compris le nom, le numéro de téléphone, la date de naissance, les données d'utilisation du site ou un autre élément identifiant."
      }
    ],
    sections: [
      {
        title: "1. Qui sommes-nous",
        blocks: [
          { type: "paragraph", text: "Le site est exploité par NB BURGER." },
          {
            type: "list",
            items: [
              `Nom de l'entreprise : ${BUSINESS.name}`,
              "Activité : restaurant / services de restauration",
              `E-mail : ${CONTACT_EMAIL}`,
              `Adresse : ${BUSINESS.address.formattedWithCountry.fr}`
            ]
          }
        ]
      },
      {
        title: "2. Quelles informations sont collectées",
        blocks: [
          {
            type: "paragraph",
            text: "Les informations collectées dépendent de l'usage du site : simple navigation, inscription au club clients, ou accès à un service externe."
          }
        ]
      },
      {
        title: "2.1 Club clients",
        blocks: [
          {
            type: "paragraph",
            text: "Le club clients est actif sur le site. Lors de l'inscription, nous collectons :"
          },
          {
            type: "list",
            items: [
              "Nom",
              "Numéro de téléphone",
              "Date de naissance, si elle est fournie (facultatif)",
              "Consentement à recevoir des communications marketing"
            ]
          },
          {
            type: "paragraph",
            text: "Si elle est fournie, la date de naissance sert aux avantages d'anniversaire et aux promotions concernées."
          },
          {
            type: "paragraph",
            text: "Les données d'inscription sont conservées dans Firebase / Firestore. L'adresse IP n'est pas enregistrée dans la fiche du club clients."
          }
        ]
      },
      {
        title: "2.2 Informations techniques",
        blocks: [
          {
            type: "paragraph",
            text: "Lors de la navigation, des informations techniques sont collectées via Google Analytics 4, notamment les pages consultées, des actions générales sur le site (par exemple un clic sur une option de commande), le type d'appareil et de navigateur, et la source d'arrivée lorsque l'outil la fournit."
          },
          {
            type: "paragraph",
            text: "Le serveur peut traiter une adresse IP à des fins techniques et de sécurité, notamment pour limiter le rythme d'envoi des formulaires (rate limiting). Ces informations ne sont pas enregistrées dans la fiche du club clients."
          }
        ]
      },
      {
        title: "2.3 Informations que nous ne collectons pas sur le site",
        blocks: [
          {
            type: "paragraph",
            text: "Le site lui-même ne collecte ni ne conserve :"
          },
          {
            type: "list",
            items: [
              "Données de carte bancaire",
              "Données de paiement",
              "Numéros de pièce d'identité",
              "Une adresse de livraison dans le cadre du site lui-même"
            ]
          },
          {
            type: "paragraph",
            text: "Si de telles informations sont demandées par un système de commande externe, elles sont traitées par ce service selon ses propres conditions et sa politique de confidentialité."
          }
        ]
      },
      {
        title: "3. Finalités d'utilisation",
        blocks: [
          {
            type: "paragraph",
            text: "Nous utilisons les informations aux fins suivantes, selon le type d'information collectée :"
          },
          {
            type: "list",
            items: [
              "Gérer le club clients",
              "Contacter les personnes inscrites au club",
              "Envoyer des actualités, avantages et promotions, sous réserve de consentement",
              "Avantages d'anniversaire et promotions concernées, si une date de naissance a été fournie",
              "Faire fonctionner le site et mémoriser la langue",
              "Comprendre l'usage du site via Google Analytics 4",
              "Sécurité technique et prévention des abus, y compris le rate limiting",
              "Répondre aux demandes relatives à la confidentialité"
            ]
          }
        ]
      },
      {
        title: "4. Consentement et communications marketing",
        blocks: [
          {
            type: "paragraph",
            text: "L'inscription au club clients comprend le consentement à recevoir des communications marketing."
          },
          {
            type: "paragraph",
            text: "NB BURGER peut envoyer aux personnes inscrites et consentantes des messages marketing, actualités, avantages et promotions via des canaux tels que le SMS et d'autres canaux pour lesquels des coordonnées ont été fournies et un consentement a été donné."
          },
          {
            type: "paragraph",
            text: "Vous pouvez vous désinscrire des SMS grâce au mécanisme de désinscription figurant dans le message, selon les instructions qui y sont jointes. Vous pouvez aussi nous écrire à l'adresse e-mail indiquée à la fin de cette politique."
          },
          {
            type: "paragraph",
            text: "Le site ne comporte pas actuellement de bouton de désinscription."
          }
        ]
      },
      {
        title: "5. Commandes",
        blocks: [
          {
            type: "paragraph",
            text: "Le site lui-même n'exécute pas de commandes, n'encaisse pas de paiement et ne conserve pas de données de carte bancaire."
          },
          {
            type: "paragraph",
            text: "Le site est destiné à permettre le passage vers un système de commande externe pour la livraison et/ou le retrait."
          },
          {
            type: "paragraph",
            text: "Lorsqu'un système de commande externe est disponible, un clic sur une option de commande peut vous rediriger vers un service externe. La suite de la commande sera également soumise à la politique de confidentialité et aux conditions de ce prestataire."
          }
        ]
      },
      {
        title: "6. Cookies",
        blocks: [
          {
            type: "paragraph",
            text: "Le site utilise des cookies et des technologies similaires, comme suit :"
          },
          {
            type: "list",
            items: [
              "Un cookie de préférence linguistique",
              "Des cookies Google Analytics 4 pour mesurer l'usage du site",
              "Des cookies techniques nécessaires au fonctionnement du site, y compris un cookie de session pour l'interface d'administration"
            ]
          },
          {
            type: "paragraph",
            text: "Lorsque du contenu Instagram est intégré, ce service peut déposer ses propres cookies."
          },
          {
            type: "paragraph",
            text: "Vous pouvez bloquer ou supprimer les cookies dans les paramètres de votre navigateur. Le blocage de certains cookies peut affecter la langue mémorisée ou la mesure d'audience."
          }
        ]
      },
      {
        title: "7. Services tiers",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER ne vend pas vos informations personnelles à des tiers."
          },
          {
            type: "paragraph",
            text: "Le site s'appuie sur les services suivants pour fonctionner :"
          },
          {
            type: "list",
            items: [
              "Google Analytics 4 — mesure de l'usage du site",
              "Firebase / Firestore — conservation des inscriptions au club et du contenu du site",
              "Instagram — affichage de contenus intégrés",
              "Leaflet, CARTO et OpenStreetMap — affichage de la carte de l'établissement",
              "Google Maps — lien d'itinéraire vers l'adresse",
              "Vercel — hébergement du site et des médias"
            ]
          },
          {
            type: "paragraph",
            text: "Ces services peuvent traiter des informations techniques, telles qu'une adresse IP ou des identifiants d'appareil, conformément à leurs propres politiques de confidentialité."
          },
          {
            type: "paragraph",
            text: "Si vous accédez à un système de commande externe, son utilisation sera également soumise à la politique de ce prestataire."
          }
        ]
      },
      {
        title: "8. Transfert d'informations hors d'Israël",
        blocks: [
          {
            type: "paragraph",
            text: "Certains des services ci-dessus, notamment l'hébergement, l'analytique et les médias, peuvent être situés hors d'Israël. Dans ce cas, les informations peuvent être traitées hors d'Israël conformément aux politiques de ces prestataires et au droit applicable."
          }
        ]
      },
      {
        title: "9. Durée de conservation",
        blocks: [
          {
            type: "paragraph",
            text: "Nous conservons les informations personnelles aussi longtemps qu'elles sont nécessaires aux finalités pour lesquelles elles ont été collectées, notamment la gestion du club clients, les communications sous réserve de consentement, le fonctionnement du site et la réponse aux demandes."
          },
          {
            type: "paragraph",
            text: "Lorsque les informations ne sont plus nécessaires, nous les supprimerons ou en limiterons l'usage, dans la mesure du possible."
          }
        ]
      },
      {
        title: "10. Sécurité des informations",
        blocks: [
          {
            type: "paragraph",
            text: "Nous prenons des mesures raisonnables pour protéger les informations, notamment en limitant l'accès à l'interface d'administration et en conservant les inscriptions du club dans un système sécurisé."
          },
          {
            type: "paragraph",
            text: "Aucun système n'est totalement sécurisé, et nous ne pouvons pas garantir une protection absolue contre une défaillance ou un accès non autorisé."
          },
          {
            type: "paragraph",
            text: "NB BURGER ne vous demandera pas d'envoyer des données de carte bancaire, des mots de passe ou d'autres informations sensibles par e-mail, SMS ou WhatsApp."
          }
        ]
      },
      {
        title: "11. Droits des utilisateurs",
        blocks: [
          {
            type: "paragraph",
            text: "Conformément au droit applicable, vous pouvez disposer de droits relatifs aux informations personnelles conservées à votre sujet, notamment l'accès, la rectification, la suppression sous réserve de la loi, et l'arrêt de l'usage des informations à des fins de communication marketing."
          },
          {
            type: "paragraph",
            text: `Pour exercer ces droits, contactez ${CONTACT_EMAIL}. Nous pourrons demander des éléments pour vérifier votre identité avant de répondre.`
          }
        ]
      },
      {
        title: "12. Mineurs",
        blocks: [
          {
            type: "paragraph",
            text: "Le site n'est pas destiné à collecter des informations auprès de mineurs sans le consentement d'un parent ou tuteur, lorsque ce consentement est requis par la loi."
          },
          {
            type: "paragraph",
            text: "Si nous apprenons que des informations ont été collectées auprès d'un mineur en violation de la loi, nous les supprimerons ou en limiterons l'usage."
          }
        ]
      },
      {
        title: "13. Liens et services externes",
        blocks: [
          {
            type: "paragraph",
            text: "Le site comporte des liens vers des réseaux sociaux, des cartes et des services externes, et peut permettre le passage vers un système de commande externe."
          },
          {
            type: "paragraph",
            text: "NB BURGER n'est pas responsable de la politique de confidentialité ni des pratiques des services externes. Il est recommandé de consulter la politique de chaque service avant d'y transmettre des données."
          }
        ]
      },
      {
        title: "14. Modifications de la politique",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER peut mettre à jour cette politique de temps à autre. La date de dernière mise à jour figure en tête du document."
          }
        ]
      },
      {
        title: "15. Contact en matière de confidentialité",
        blocks: [
          {
            type: "paragraph",
            text: "Pour toute question, demande ou réclamation relative à cette politique, contactez-nous :"
          },
          {
            type: "list",
            items: [
              `Nom de l'entreprise : ${BUSINESS.name}`,
              `E-mail : ${CONTACT_EMAIL}`,
              `Adresse : ${BUSINESS.address.formattedWithCountry.fr}`
            ]
          },
          {
            type: "paragraphWithLink",
            before: "E-mail pour les demandes de confidentialité : ",
            href: `mailto:${CONTACT_EMAIL}`,
            linkText: CONTACT_EMAIL
          }
        ]
      }
    ]
  };
}
