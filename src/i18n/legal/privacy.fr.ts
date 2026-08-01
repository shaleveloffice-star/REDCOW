import { BUSINESS } from "@/data/business";
import type { LegalDocument } from "@/i18n/legal/types";

export function getPrivacyContentFr(): LegalDocument {
  return {
    lastUpdated: "Dernière mise à jour : mars 2026",
    title: "Politique de confidentialité – NB BURGER",
    introTitle: "Introduction",
    introBlocks: [
      { type: "paragraph", text: "Bienvenue sur le site web de NB BURGER." },
      {
        type: "paragraph",
        text: "La présente politique de confidentialité vise à expliquer clairement comment NB BURGER collecte, conserve, utilise et protège les informations personnelles transmises par les utilisateurs du site."
      },
      {
        type: "paragraph",
        text: "Le site sert à présenter des informations sur NB BURGER, notamment la marque, le menu, l'établissement, les horaires d'ouverture, les actualités, les coordonnées et tout autre contenu lié à l'activité de l'entreprise."
      },
      {
        type: "paragraph",
        text: "À ce stade, le site n'est pas utilisé pour passer des commandes en ligne et ne conserve pas de données de paiement, d'informations bancaires ou de données financières des utilisateurs."
      },
      {
        type: "paragraph",
        text: "Les informations personnelles collectées sur le site sont principalement celles que l'utilisateur transmet volontairement, par exemple via un formulaire de contact, un formulaire d'inscription aux actualités ou une demande envoyée par le site."
      },
      {
        type: "paragraph",
        text: "NB BURGER respecte la vie privée des utilisateurs du site et s'engage à agir conformément à la législation applicable, notamment la loi israélienne sur la protection de la vie privée de 1981, l'amendement 13 à cette loi, la loi sur les communications de 1982, ainsi que toute autre réglementation pertinente."
      },
      {
        type: "paragraph",
        text: "Le présent document est rédigé au masculin pour des raisons de commodité uniquement et s'applique à tous les genres de manière égale."
      },
      {
        type: "paragraph",
        text: "L'utilisation du site ou la transmission de données personnelles via le site vaut confirmation que vous avez lu et compris la présente politique de confidentialité. Si vous n'y consentez pas, veuillez vous abstenir d'utiliser le site ou de transmettre des données personnelles."
      },
      {
        type: "paragraph",
        text: "Vous n'êtes pas légalement tenu de nous fournir des informations personnelles. Toutefois, sans certaines données, nous pourrions ne pas être en mesure de vous contacter, de vous envoyer des actualités ou de traiter une demande que vous avez soumise via le site."
      },
      {
        type: "paragraph",
        text: "Dans la présente politique, « information personnelle » désigne toute information permettant d'identifier une personne, directement ou indirectement, y compris le nom, le numéro de téléphone, l'adresse e-mail, l'adresse IP, les données d'utilisation du site ou tout autre élément permettant d'identifier une personne avec un effort raisonnable."
      }
    ],
    sections: [
      {
        title: "1. Qui sommes-nous",
        blocks: [
          { type: "paragraph", text: "Le site est exploité par NB BURGER." },
          {
            type: "paragraph",
            text: "Pour toute question relative à la confidentialité, vous pouvez nous contacter aux coordonnées indiquées à la fin du présent document."
          },
          {
            type: "list",
            items: [
              `Nom de l'entreprise : ${BUSINESS.name}`,
              "Activité : restaurant / chaîne de burgers / services alimentaires",
              `E-mail : ${BUSINESS.email}`,
              `Adresse : ${BUSINESS.address.formattedWithCountry.fr}`
            ]
          }
        ]
      },
      {
        title: "2. Quelles informations collectons-nous",
        blocks: [
          {
            type: "paragraph",
            text: "Lors de l'utilisation du site, nous pouvons collecter des informations personnelles et des informations techniques, selon votre mode d'utilisation."
          }
        ]
      },
      {
        title: "2.1 Informations que vous nous transmettez directement",
        blocks: [
          {
            type: "paragraph",
            text: "Nous pouvons collecter les informations que vous transmettez volontairement, notamment :"
          },
          {
            type: "list",
            items: [
              "Nom complet",
              "Numéro de téléphone",
              "Adresse e-mail, le cas échéant",
              "Contenu d'un message ou d'une demande, le cas échéant",
              "Informations transmises via un formulaire d'actualités",
              "Informations transmises via un formulaire de contact",
              "Toute autre information que vous choisissez de nous fournir de votre propre initiative"
            ]
          }
        ]
      },
      {
        title: "2.2 Informations collectées via les formulaires",
        blocks: [
          {
            type: "paragraph",
            text: "Lorsque vous transmettez vos coordonnées sur le site, nous pouvons conserver les informations suivantes :"
          },
          {
            type: "list",
            items: [
              "Nom",
              "Téléphone",
              "E-mail, s'il figure dans le formulaire",
              "Date et heure d'envoi du formulaire",
              "Source de provenance sur le site, lorsque identifiable",
              "Contenu de la demande, le cas échéant",
              "Consentement à recevoir des actualités et messages promotionnels, le cas échéant"
            ]
          },
          {
            type: "paragraph",
            text: "Ces informations seront utilisées pour vous contacter, répondre à votre demande, vous envoyer des actualités, des messages promotionnels et des informations relatives à NB BURGER, conformément à votre consentement et à la législation applicable."
          }
        ]
      },
      {
        title: "2.3 Informations techniques collectées automatiquement",
        blocks: [
          {
            type: "paragraph",
            text: "Lors de l'utilisation du site, des informations techniques peuvent être collectées automatiquement, notamment :"
          },
          {
            type: "list",
            items: [
              "Adresse IP",
              "Type de navigateur",
              "Type d'appareil",
              "Système d'exploitation",
              "Langue du navigateur",
              "Pages consultées sur le site",
              "Durée de visite",
              "Actions effectuées sur le site",
              "Source de provenance",
              "Données d'utilisation générales",
              "Données de performance, erreurs et journaux"
            ]
          },
          {
            type: "paragraph",
            text: "Ces informations peuvent être collectées via des cookies, des outils de mesure, des systèmes d'analyse, des pixels, des balises et des technologies similaires."
          }
        ]
      },
      {
        title: "2.4 Informations que nous ne collectons pas sur le site",
        blocks: [
          {
            type: "paragraph",
            text: "À ce stade, le site ne collecte ni ne conserve :"
          },
          {
            type: "list",
            items: [
              "Coordonnées bancaires",
              "Informations de paiement",
              "Numéros d'identité",
              "Coordonnées de compte bancaire",
              "Informations médicales",
              "Données biométriques",
              "Détails de commandes en ligne",
              "Adresses de livraison transmises via le site"
            ]
          },
          {
            type: "paragraph",
            text: "Si de nouveaux services sont ajoutés à l'avenir, tels que la commande en ligne, un programme de fidélité, un système de paiement ou d'autres services, la présente politique sera mise à jour en conséquence."
          }
        ]
      },
      {
        title: "3. Finalités d'utilisation",
        blocks: [
          {
            type: "paragraph",
            text: "Les informations collectées sur le site seront utilisées aux fins suivantes :"
          },
          {
            type: "list",
            items: [
              "Contacter les utilisateurs ayant transmis leurs coordonnées",
              "Répondre aux demandes envoyées via le site",
              "Envoyer des actualités concernant NB BURGER",
              "Communiquer des informations sur les ouvertures, le menu, les promotions, les avantages, les événements et les lancements",
              "Gérer une liste de personnes intéressées",
              "Gérer des communications marketing, sous réserve de consentement",
              "Améliorer l'expérience utilisateur sur le site",
              "Analyser l'activité sur le site",
              "Mesurer les performances des campagnes",
              "Améliorer les contenus, le design et les services du site",
              "Publicité ciblée et reciblage",
              "Sécuriser le site et prévenir les usages abusifs",
              "Identifier les dysfonctionnements et assurer la maintenance technique",
              "Respecter les exigences légales ou les instructions d'une autorité compétente",
              "Protéger les droits de NB BURGER, de ses clients ou de tiers"
            ]
          },
          {
            type: "paragraph",
            text: "Nous pouvons combiner les informations que vous transmettez avec des informations techniques collectées sur le site afin d'améliorer le service, d'adapter les contenus, d'analyser les données et de mener des actions marketing."
          }
        ]
      },
      {
        title: "4. Transmission des informations et consentement",
        blocks: [
          {
            type: "paragraph",
            text: "La transmission d'informations personnelles sur le site est volontaire et repose sur votre consentement."
          },
          {
            type: "paragraph",
            text: "Lorsque vous remplissez un formulaire sur le site et transmettez vos coordonnées, vous confirmez que les informations fournies sont exactes et que NB BURGER est autorisée à les utiliser pour vous contacter et traiter votre demande."
          },
          {
            type: "paragraph",
            text: "Lorsque vous cochez une case d'acceptation pour recevoir des actualités ou des messages promotionnels, vous consentez à recevoir des messages et actualités de NB BURGER, y compris des messages promotionnels, conformément à la législation applicable."
          },
          {
            type: "paragraph",
            text: "Vous pouvez demander à tout moment de ne plus recevoir de messages promotionnels, conformément aux modalités prévues dans la présente politique."
          }
        ]
      },
      {
        title: "5. Communication à des tiers",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER ne vendra pas vos informations personnelles à des tiers."
          },
          {
            type: "paragraph",
            text: "Toutefois, nous pouvons transférer des informations personnelles ou en autoriser l'accès à des tiers uniquement lorsque cela est nécessaire au fonctionnement du site, à la gestion de l'activité, à la communication, au marketing, à la sécurité ou au respect des obligations légales."
          },
          {
            type: "paragraph",
            text: "Les informations peuvent être communiquées notamment aux entités suivantes :"
          },
          {
            type: "list",
            items: [
              "Hébergeurs et fournisseurs de serveurs",
              "Fournisseurs de services cloud",
              "Prestataires de développement et de maintenance du site",
              "Systèmes CRM",
              "Systèmes d'e-mailing et d'automatisation",
              "Plateformes de publicité numérique",
              "Systèmes d'analyse et de mesure",
              "Prestataires de sécurité informatique",
              "Prestataires de service client et de support",
              "Conseils professionnels, y compris avocats et experts-comptables",
              "Autorités compétentes, lorsque la loi l'exige"
            ]
          },
          {
            type: "paragraph",
            text: "Toute communication d'informations sera effectuée conformément aux finalités décrites dans la présente politique et à la législation applicable."
          }
        ]
      },
      {
        title: "6. Commandes et paiements",
        blocks: [
          {
            type: "paragraph",
            text: "À ce stade, le site ne permet pas de passer des commandes en ligne et ne conserve pas de données de paiement."
          },
          {
            type: "paragraph",
            text: "Si une option de commande apparaît sur le site, elle pourra être traitée via un système externe non exploité directement par NB BURGER."
          },
          {
            type: "paragraph",
            text: "Dans ce cas, l'utilisation du système externe sera soumise à la politique de confidentialité et aux conditions d'utilisation de ce prestataire."
          },
          {
            type: "paragraph",
            text: "NB BURGER ne conserve pas sur le site de coordonnées bancaires, d'informations de paiement ou de données financières des utilisateurs."
          }
        ]
      },
      {
        title: "7. Utilisation des cookies et technologies similaires",
        blocks: [
          {
            type: "paragraph",
            text: "Le site peut utiliser des cookies, pixels, balises et technologies similaires."
          },
          {
            type: "paragraph",
            text: "Les cookies sont de petits fichiers enregistrés dans votre navigateur ou sur votre appareil, permettant au site de reconnaître l'appareil, d'enregistrer des préférences, de mesurer l'activité et d'améliorer l'expérience utilisateur."
          },
          {
            type: "paragraph",
            text: "Les cookies peuvent être utilisés aux fins suivantes :"
          },
          {
            type: "list",
            items: [
              "Fonctionnement normal du site",
              "Enregistrement des préférences utilisateur",
              "Amélioration de la vitesse et de l'expérience de navigation",
              "Mesure du trafic sur le site",
              "Analyse du comportement des utilisateurs",
              "Évaluation des performances des campagnes",
              "Publicité ciblée",
              "Reciblage marketing",
              "Sécurisation du site",
              "Identification des dysfonctionnements et amélioration du service"
            ]
          },
          {
            type: "paragraph",
            text: "Nous pouvons utiliser des outils tels que Google Analytics, Google Tag Manager, Meta Pixel, TikTok Pixel et des outils similaires."
          },
          {
            type: "paragraph",
            text: "Ces outils peuvent collecter des informations sur l'utilisation du site, notamment les pages consultées, les actions effectuées, la source de provenance, le type d'appareil et d'autres données d'utilisation."
          },
          {
            type: "paragraph",
            text: "Vous pouvez bloquer ou supprimer les cookies via les paramètres de votre navigateur. Toutefois, le blocage de certains cookies peut affecter certaines fonctionnalités du site."
          }
        ]
      },
      {
        title: "8. Prospection directe et messages promotionnels",
        blocks: [
          {
            type: "paragraph",
            text: "Si vous avez transmis vos coordonnées sur le site et consenti à recevoir des actualités, NB BURGER pourra vous envoyer des messages et actualités par différents moyens, notamment :"
          },
          {
            type: "list",
            items: ["SMS", "WhatsApp", "E-mail", "Appel téléphonique", "Messages système", "Tout autre moyen de communication que vous nous avez communiqué"]
          },
          {
            type: "paragraph",
            text: "Ces messages peuvent inclure des informations sur l'ouverture de l'établissement, le menu, les promotions, les avantages, les événements, les lancements, les enquêtes, les activités et d'autres actualités."
          },
          {
            type: "paragraph",
            text: "Vous pouvez demander à tout moment d'être retiré de la liste de diffusion ou de ne plus recevoir de messages promotionnels en nous contactant aux coordonnées indiquées dans la présente politique ou via un lien de désinscription, le cas échéant."
          },
          {
            type: "paragraph",
            text: "Il est précisé qu'après une désinscription des communications marketing, nous pourrons continuer à envoyer des messages de service ou opérationnels non promotionnels, lorsque cela est nécessaire pour traiter une demande, fournir un service ou respecter les obligations légales."
          }
        ]
      },
      {
        title: "9. Utilisation de l'automatisation et de l'intelligence artificielle",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER peut utiliser des systèmes d'automatisation, des systèmes CRM, des outils d'analyse de données, des outils d'intelligence artificielle et des chatbots aux fins suivantes :"
          },
          {
            type: "list",
            items: [
              "Répondre aux demandes",
              "Filtrer et orienter les demandes",
              "Améliorer le service client",
              "Analyser les données",
              "Améliorer l'expérience utilisateur",
              "Adapter les contenus et offres",
              "Automatiser les processus marketing et opérationnels"
            ]
          },
          {
            type: "paragraph",
            text: "Lorsqu'un chatbot ou un système automatisé est utilisé dans l'interaction avec les utilisateurs, nous veillerons à préciser qu'il s'agit d'un système automatisé, lorsque la loi l'exige."
          },
          {
            type: "paragraph",
            text: "NB BURGER n'utilisera pas de systèmes automatisés pour prendre des décisions significatives affectant vos droits sans possibilité d'examen humain, lorsque la loi l'exige."
          }
        ]
      },
      {
        title: "10. Durée de conservation",
        blocks: [
          {
            type: "paragraph",
            text: "Nous conserverons les informations personnelles aussi longtemps que nécessaire aux fins pour lesquelles elles ont été collectées, notamment :"
          },
          {
            type: "list",
            items: [
              "Vous contacter",
              "Traiter les demandes",
              "Gérer les listes de diffusion",
              "Envoyer des actualités",
              "Marketing et communication",
              "Gestion normale de l'activité",
              "Respect des obligations légales",
              "Protection juridique",
              "Résolution des litiges",
              "Sécurité des informations"
            ]
          },
          {
            type: "paragraph",
            text: "Lorsque les informations ne sont plus nécessaires, nous prendrons des mesures pour les supprimer, les limiter ou les anonymiser, dans la mesure du possible et conformément à la loi."
          }
        ]
      },
      {
        title: "11. Sécurité des informations",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER met en œuvre des mesures raisonnables et reconnues pour protéger les informations personnelles qui lui sont transmises, y compris des mesures technologiques et organisationnelles visant à réduire les risques d'accès non autorisé, d'utilisation abusive, de perte, de modification, de suppression ou de divulgation non autorisée."
          },
          {
            type: "paragraph",
            text: "Ces mesures peuvent inclure notamment :"
          },
          {
            type: "list",
            items: [
              "Utilisation de systèmes sécurisés",
              "Permissions d'accès limitées",
              "Utilisation de mots de passe et de contrôles d'autorisation",
              "Mesures de sécurité sur le site et les serveurs",
              "Collaboration avec des prestataires engagés en matière de sécurité",
              "Surveillance des dysfonctionnements et des tentatives d'accès anormales"
            ]
          },
          {
            type: "paragraph",
            text: "Toutefois, il est important de savoir qu'aucun système d'information n'est totalement sécurisé et que nous ne pouvons garantir une protection absolue contre l'intrusion, les dysfonctionnements, l'accès non autorisé ou l'utilisation abusive des informations."
          },
          {
            type: "paragraph",
            text: "NB BURGER ne vous demandera pas d'envoyer des coordonnées bancaires complètes, des mots de passe ou d'autres informations sensibles par e-mail, SMS ou WhatsApp."
          }
        ]
      },
      {
        title: "12. Droits des utilisateurs",
        blocks: [
          {
            type: "paragraph",
            text: "Conformément à la loi israélienne sur la protection de la vie privée de 1981 et à ses amendements applicables, vous pouvez disposer de différents droits concernant les informations personnelles conservées à votre sujet, notamment :"
          },
          {
            type: "list",
            items: [
              "Le droit de consulter les informations personnelles conservées à votre sujet",
              "Le droit de demander la correction d'informations inexactes, incomplètes, imprécises ou obsolètes",
              "Le droit de demander la suppression d'informations, sous réserve de la loi",
              "Le droit de demander l'arrêt de l'utilisation des informations à des fins de prospection directe",
              "Le droit de demander le retrait d'une liste de diffusion",
              "Le droit de recevoir des informations sur les finalités d'utilisation",
              "Le droit de nous contacter pour toute question relative à la confidentialité"
            ]
          },
          {
            type: "paragraph",
            text: "Pour exercer vos droits, nous pourrons vous demander de fournir des informations supplémentaires afin de vérifier votre identité et de nous assurer que les informations sont communiquées à la personne autorisée."
          },
          {
            type: "paragraph",
            text: "Nous examinerons chaque demande conformément à la loi et y répondrons dans un délai raisonnable et conformément à nos obligations légales."
          }
        ]
      },
      {
        title: "13. Mineurs",
        blocks: [
          {
            type: "paragraph",
            text: "Le site et les services numériques ne sont pas destinés à collecter des informations auprès de mineurs sans le consentement d'un parent ou tuteur, lorsque ce consentement est requis par la loi."
          },
          {
            type: "paragraph",
            text: "Si vous êtes mineur, vous devez obtenir l'autorisation de votre parent ou tuteur légal avant de transmettre des données personnelles sur le site."
          },
          {
            type: "paragraph",
            text: "Si nous apprenons que des informations personnelles ont été collectées auprès d'un mineur en violation de la loi ou sans le consentement requis, nous prendrons des mesures pour les supprimer ou en limiter l'utilisation, conformément aux circonstances et à la loi."
          }
        ]
      },
      {
        title: "14. Liens vers des sites et services externes",
        blocks: [
          {
            type: "paragraph",
            text: "Le site peut inclure des liens vers des sites web, pages, réseaux sociaux, systèmes de commande externes ou autres services externes."
          },
          {
            type: "paragraph",
            text: "NB BURGER n'est pas responsable des politiques de confidentialité, de la sécurité des informations, du contenu ou du comportement des sites et services externes."
          },
          {
            type: "paragraph",
            text: "Nous recommandons de consulter la politique de confidentialité et les conditions d'utilisation de tout service externe avant de l'utiliser ou de transmettre des données personnelles."
          }
        ]
      },
      {
        title: "15. Transfert d'informations hors d'Israël",
        blocks: [
          {
            type: "paragraph",
            text: "Certaines informations peuvent être conservées ou traitées via des prestataires situés hors d'Israël, notamment des services cloud, des systèmes d'e-mailing, des systèmes CRM, des systèmes d'analyse, des systèmes publicitaires et d'autres prestataires technologiques."
          },
          {
            type: "paragraph",
            text: "Dans ce cas, NB BURGER agira, lorsque requis, conformément à la législation applicable relative au transfert d'informations hors d'Israël."
          }
        ]
      },
      {
        title: "16. Informations anonymes et statistiques",
        blocks: [
          {
            type: "paragraph",
            text: "Nous pouvons utiliser des informations ne permettant pas de vous identifier personnellement, y compris des informations statistiques, agrégées ou anonymes, aux fins suivantes :"
          },
          {
            type: "list",
            items: [
              "Analyser l'activité sur le site",
              "Améliorer les services",
              "Mesurer les performances",
              "Améliorer les campagnes",
              "Comprendre les préférences des utilisateurs",
              "Prendre des décisions commerciales"
            ]
          },
          {
            type: "paragraph",
            text: "Les informations ne permettant pas d'identifier une personne ne sont pas considérées comme des informations personnelles, et nous pouvons les utiliser conformément à la loi."
          }
        ]
      },
      {
        title: "17. Enquêtes, retours et activités publiques",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER peut organiser des enquêtes, recueillir des retours, des questionnaires, des activités publiques, des tests de préférences, des dégustations, des promotions ou des activités marketing."
          },
          {
            type: "paragraph",
            text: "Dans le cadre de ces activités, nous pouvons collecter des informations telles que :"
          },
          {
            type: "list",
            items: [
              "Nom",
              "Téléphone",
              "Réponses aux enquêtes",
              "Préférences alimentaires",
              "Commentaires et retours",
              "Participation à une activité",
              "Informations supplémentaires que vous transmettez"
            ]
          },
          {
            type: "paragraph",
            text: "Ces informations peuvent être utilisées pour améliorer le menu, comprendre les préférences du public, développer des produits, mener des actions marketing, vous contacter et offrir des avantages, sous réserve de votre consentement et de la loi."
          }
        ]
      },
      {
        title: "18. Modifications de la politique de confidentialité",
        blocks: [
          {
            type: "paragraph",
            text: "NB BURGER peut mettre à jour la présente politique de confidentialité de temps à autre, conformément aux évolutions du site, des services, des exigences légales, des besoins commerciaux ou des technologies utilisées."
          },
          {
            type: "paragraph",
            text: "La date de la dernière mise à jour apparaîtra en haut de la politique."
          },
          {
            type: "paragraph",
            text: "Une modification substantielle de la politique pourra être publiée sur le site ou par tout autre moyen que nous jugerons approprié, lorsque la loi l'exige."
          },
          {
            type: "paragraph",
            text: "La poursuite de l'utilisation du site après la mise à jour de la politique vaut acceptation de la politique mise à jour."
          }
        ]
      },
      {
        title: "19. Nous contacter au sujet de la confidentialité",
        blocks: [
          {
            type: "paragraph",
            text: "Pour toute question, demande, réclamation ou demande relative à la présente politique de confidentialité ou à l'exercice de vos droits, vous pouvez nous contacter :"
          },
          {
            type: "list",
            items: [
              `Nom de l'entreprise : ${BUSINESS.name}`,
              `E-mail : ${BUSINESS.email}`,
              `Adresse : ${BUSINESS.address.formattedWithCountry.fr}`
            ]
          },
          {
            type: "paragraph",
            text: "Nous examinerons votre demande et y répondrons conformément à la législation applicable."
          }
        ]
      }
    ]
  };
}
