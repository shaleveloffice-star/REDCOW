import type { Messages } from "./types";

export const fr: Messages = {
  lang: {
    label: "Langue",
    switchTo: "Changer de langue"
  },
  nav: {
    main: "Navigation principale",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    home: "Accueil",
    menu: "Carte",
    plancha: "Sur la Plancha",
    atmosphere: "Ambiance",
    club: "Club client",
    location: "Adresse & Horaires"
  },
  hero: {
    tagline: "Simplement un bon burger.",
    menuCta: "Voir la carte",
    orderCta: "Commander",
    scroll: "Défiler",
    scrollAria: "Défiler vers le bas"
  },
  menuShowcase: {
    title: "La Carte",
    lead: "Le standard NB, élevé.",
    trackAria: "Aperçu de la carte",
    bestSeller: "Le plus vendu",
    fullMenu: "Carte complète"
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
    kicker: "NB Club",
    title: "Club client",
    titlePrimary: "Club",
    titleAccent: "client",
    leadBefore: "Rejoignez le club pour des ",
    leadHighlight: "avantages, nouveautés et surprises",
    leadAfter: " en avant-première.",
    cardAlt: "Carte membre NB Club",
    burgerAlt: "Burger NB",
    formHint: "Inscription en 10 secondes seulement",
    socialProof: "Plus de 2 300 membres profitent déjà du club",
    trustSafe: "Vos informations sont en sécurité",
    trustTerms: "Sans frais | Sans engagement | Annulation à tout moment",
    perksAria: "Avantages du club",
    perks: [
      {
        title: "Cadeau d'anniversaire",
        desc: "Une surprise gourmande de notre cuisine, le jour J."
      },
      {
        title: "En avant-première",
        desc: "Accès anticipé aux nouveautés et campagnes spéciales."
      },
      {
        title: "Avantages exclusifs",
        desc: "Offres et infos envoyées directement — sans spam."
      }
    ],
    fields: {
      fullName: "Nom complet",
      phone: "Téléphone",
      email: "E-mail (optionnel)",
      birthDate: "Date de naissance (optionnel)"
    },
    consentPrefix: "J'accepte de recevoir les actualités et avantages du club conformément à la",
    privacyLink: "Politique de confidentialité",
    submit: "Obtenir mes avantages",
    submitting: "Envoi...",
    successTitle: "Bienvenue au club !",
    successMessage: "Nous avons bien reçu votre inscription. Nous vous contacterons très bientôt.",
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
      pickYear: "Choisir l'année"
    }
  },
  location: {
    title: "Adresse & Horaires",
    locationHeading: "Adresse",
    address: "1 rue Weizmann, Kfar Saba",
    parking: "Parking gratuit en abondance",
    hoursHeading: "Horaires",
    days: {
      sunThu: "Dim - Jeu",
      fri: "Vendredi",
      sat: "Samedi"
    },
    hours: {
      sunThu: "11h00 - 23h00",
      fri: "11h00 - une heure avant Shabbat",
      sat: "12h00 - 23h00"
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
