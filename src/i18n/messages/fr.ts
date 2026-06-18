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
    leadLine2: "et des gens avec qui on a envie de rester."
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
    steps: ["Bienvenue", "Notre carte", "Sur la plancha", "L'ambiance", "Nous trouver", "Commander"]
  }
};
