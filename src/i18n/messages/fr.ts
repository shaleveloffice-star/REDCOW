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
    pickup: "CLICK & COLLECT",
    delivery: "LIVRAISON"
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
    title: "La Carte",
    lead: "Le standard NB, élevé.",
    trackAria: "Aperçu de la carte",
    bestSeller: "Le plus vendu",
    fullMenu: "Carte complète",
    prev: "Plats précédents",
    next: "Plats suivants"
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
  },
  shortTour: {
    trigger: "Visite rapide",
    triggerAria: "Lancer une visite rapide du site",
    dialogAria: "Visite rapide du site",
    skip: "Passer la visite",
    steps: ["Bienvenue", "Notre carte", "L'ambiance", "Sur la plancha", "Nous trouver", "Commander"]
  }
};
