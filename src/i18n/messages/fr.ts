import { BUSINESS } from "@/data/business";
import type { Messages } from "./types";

export const fr: Messages = {
  a11y: {
    skipToMain: "Aller au contenu principal"
  },
  lang: {
    label: "Langue",
    switchTo: "Changer de langue"
  },
  nav: {
    main: "Navigation principale",
    menuDialog: "Menu de navigation",
    openMenu: "Ouvrir le menu de navigation",
    closeMenu: "Fermer le menu de navigation",
    home: "Accueil",
    menu: "Carte",
    plancha: "Sur la Plancha",
    atmosphere: "Ambiance",
    club: "Club client",
    location: "Adresse & Horaires",
    about: "À propos",
    branches: "Adresses"
  },
  hero: {
    tagline: "Simplement un bon burger.",
    captionKicker: "REDÉFINIR L'EXPÉRIENCE BURGER",
    captionTitle: "NB BURGER",
    menuCta: "Voir la carte",
    orderCta: "Commander",
    scroll: "Défiler",
    scrollAria: "Défiler vers le bas"
  },
  orderModal: {
    title: "Choisissez votre commande",
    close: "Fermer",
    pickup: "À emporter",
    delivery: "Livraison"
  },
  menuPage: {
    title: "Notre carte",
    filterAll: "Tout",
    empty: "Aucun plat à afficher pour le moment.",
    viewLocations: "Voir nos adresses",
    heroAlt: "Plats de la carte NB BURGER"
  },
  menuItemDetail: {
    orderNow: "Commander",
    galleryAria: "Photos du plat",
    closeUpAlt: "gros plan",
    backToMenu: "Retour à la carte",
    longSectionAria: "Description complète",
    allergyGuide: "Guide des allergènes"
  },
  locations: {
    findLocal: "Trouver un restaurant",
    ourLocations: "Nos restaurants",
    mapTitle: "Carte des restaurants NB BURGER",
    navigate: "Itinéraire",
    deliveryZonesTitle: "Zones de livraison",
    deliveryZones: ["Hod Hasharon", "Kfar Saba", "Ra'anana"],
    backHome: "Retour à l'accueil"
  },
  menuShowcase: {
    title: "Notre carte",
    lead: "Burgers, frites, milkshakes et plus encore !",
    trackAria: "Aperçu de la carte",
    bestSeller: "Le plus vendu",
    fullMenu: "Voir la carte complète",
    prev: "Plats précédents",
    next: "Plats suivants"
  },
  homeStory: {
    title: "Pas un burger de plus.",
    imageAlt: "Hamburger NB BURGER",
    intro: "Chez NB BURGER, nous croyons que la qualité n'a pas besoin de longs discours.",
    punchLines: [
      "Bœuf de qualité, haché sur place chaque jour.",
      "Pains briochés frais.",
      "Sauces préparées sur place.",
      "Des ingrédients choisis avec soin."
    ],
    closing: [
      "Chaque burger est saisi à la commande et servi exactement comme il doit l'être — juteux, précis, sans compromis.",
      "Parce qu'au fond, il n'est pas nécessaire de réinventer le burger.",
      "Il suffit de le préparer comme il se doit."
    ]
  },
  plancha: {
    title: "Sur la Plancha",
    lead: "Viande fraîche, hachée sur place, directement sur le feu.",
    listAria: "Étapes du burger sur la plancha",
    steps: [
      {
        title: "La Viande",
        desc: "Hachée sur place, assaisonnée avec soin, et posée sur la plancha fraîche et précise."
      },
      {
        title: "La Saisie",
        desc: "Chaleur intense, une belle croûte qui donne tout son caractère à la bouchée."
      },
      {
        title: "La Bouchée",
        desc: "Pain moelleux, légumes frais et une sauce qui relie le tout sans dominer."
      }
    ]
  },
  atmosphere: {
    title: "L'Ambiance",
    leadLine1: "Bonne cuisine, musique en fond,",
    leadLine2: "et des gens avec qui on a envie de rester.",
    introTitle: "L'art entre deux pains.",
    introLead: "Une galette premium de bouchers sélectionnés, hachée sur place chaque jour.",
    droneAlt: "Vue drone",
    burgerStackAlt: "Burger éclaté",
    bottomAlt: "Pain du bas"
  },
  faq: {
    kicker: "FAQ",
    title: "Questions & Réponses",
    lead: "Tout ce qu'il faut savoir avant la prochaine bouchée.",
    items: [
      {
        question: "Où manger un burger casher à Ra'anana ?",
        answer:
          "NB BURGER propose une expérience burger casher à Ra'anana, avec des burgers juteux, des ingrédients de qualité et des plats préparés sur place. Vous pouvez manger sur place ou commander en livraison."
      },
      {
        question: "Quelle supervision casher a NB BURGER ?",
        answer:
          "NB BURGER est un restaurant casher sous supervision rabbinique. Notre carte de viande convient aux personnes qui gardent la cacheroute et comprend une variété de burgers et d'autres plats."
      },
      {
        question: "Qu'est-ce qui rend le smash burger de NB BURGER spécial ?",
        answer:
          "Notre smash burger repose sur une galette de bœuf saisie sur une plaque chaude pour une belle croûte et un goût riche, servie avec des garnitures et des sauces qui complètent la bouchée."
      },
      {
        question: "Peut-on commander une livraison de burgers chez NB BURGER ?",
        answer:
          "Oui. Vous pouvez commander une livraison depuis NB BURGER à Ra'anana et dans les zones disponibles, et profiter de nos plats à la maison ou au travail."
      },
      {
        question: "Quels sont les horaires de NB BURGER ?",
        answer:
          "Les horaires peuvent varier selon le jour et les fêtes. Nous recommandons de vérifier les horaires à jour sur le site avant de venir ou de commander."
      },
      {
        question: "Que trouve-t-on sur la carte de NB BURGER ?",
        answer:
          "Vous y trouverez une variété de burgers, smash burgers, accompagnements, extras et sauces. Vous pouvez consulter la carte complète sur le site et choisir ce qui vous convient."
      }
    ]
  },
  customerClub: {
    kicker: "NB CLUB",
    title: "Club client",
    titlePrimary: "Club",
    titleAccent: "client",
    lead: "Avantages exclusifs, offres spéciales et une expérience burger d'un autre niveau",
    leadBefore: "",
    leadHighlight: "",
    leadAfter: "",
    cardAlt: "Carte membre NB Club",
    burgerAlt: "Burger NB",
    formTitle: "Rejoignez-nous",
    formSubtitle: "Et accédez à un monde d'avantages",
    formHint: "Inscription rapide",
    socialProof: "2 300+ membres",
    trustSafe: "Vos infos restent chez nous",
    trustTerms: "Gratuit · Sans engagement",
    barBrandSub: "REAL BURGERS. REAL PEOPLE.",
    barSlogan: "NB CLUB — MORE THAN A BURGER",
    perksAria: "Avantages du club",
    features: [
      { title: "Offres exclusives" },
      { title: "Avantages perso" },
      { title: "Cadeau d'anniversaire" }
    ],
    perks: [
      { title: "Cadeau d'anniversaire", desc: "" },
      { title: "En avant-première", desc: "" },
      { title: "Avantages exclusifs", desc: "" }
    ],
    formPerks: [
      { title: "Membres seulement", desc: "Avantages exclusifs" },
      { title: "Offres spéciales", desc: "Vraies réductions" },
      { title: "Autre niveau", desc: "Cuisine au top" }
    ],
    fields: {
      fullName: "Nom complet",
      phone: "Téléphone",
      email: "E-mail (optionnel)",
      birthDate: "Date de naissance"
    },
    consentPrefix: "J'accepte de recevoir actus et cadeaux",
    privacyLink: "Confidentialité",
    submit: "S'inscrire",
    submitting: "Envoi...",
    successTitle: "C'est bon !",
    successMessage: "On vous recontacte bientôt avec vos avantages.",
    errors: {
      fullName: "Veuillez saisir votre nom complet.",
      phone: "Veuillez saisir votre numéro de téléphone.",
      email: "Veuillez saisir une adresse e-mail valide si renseignée.",
      consent: "Veuillez accepter les conditions du club.",
      generic: "Une erreur est survenue. Veuillez réessayer."
    },
    datePicker: {
      year: "Année",
      month: "Mois",
      day: "Jour",
      yearPlaceholder: "Choisir l'année",
      monthPlaceholder: "Choisir le mois",
      dayPlaceholder: "Choisir le jour",
      prevMonth: "Mois précédent",
      nextMonth: "Mois suivant",
      pickYear: "Choisir l'année",
      pickMonth: "Choisir le mois"
    }
  },
  location: {
    title: "Adresse & Horaires",
    locationHeading: "Adresse",
    address: BUSINESS.address.formatted.fr,
    parking: "Parking gratuit en abondance",
    hoursHeading: "Horaires",
    days: {
      sunThu: "Dim - Jeu",
      fri: "Vendredi",
      sat: "Samedi"
    },
    hours: {
      sunThu: BUSINESS.displayHours.weekday,
      sat: BUSINESS.displayHours.saturday
    },
    navigate: "Itinéraire",
    imageAlt: "Façade du restaurant"
  },
  footer: {
    taglineLine1: "Viande hachée sur place,",
    taglineLine2: "plancha brûlante, une bouchée bien construite.",
    contact: "Contact",
    followUs: "Suivez-nous",
    mapAria: "Emplacement sur la carte",
    nav: "Navigation",
    menu: "Carte",
    fullMenu: "Carte complète",
    copyright: "© 2026 NB BURGER - Tous droits réservés",
    privacy: "Politique de confidentialité",
    terms: "Conditions d'utilisation",
    closing: "Pour chaque moment. Une bouchée inoubliable."
  }
};
