import { BUSINESS } from "@/data/business";
import type { Messages } from "./types";

export const fr: Messages = {
  a11y: {
    skipToMain: "Aller au contenu principal",
    pauseVideo: "Mettre la vidéo en pause",
    playVideo: "Lire la vidéo",
    openWidget: "Accessibilité",
    closeWidget: "Fermer le menu d'accessibilité",
    widgetTitle: "Options d'accessibilité",
    textSize: "Taille du texte",
    increaseText: "Plus grand",
    decreaseText: "Plus petit",
    highContrast: "Contraste élevé",
    highlightLinks: "Surligner les liens",
    reduceMotion: "Réduire les animations",
    reset: "Réinitialiser"
  },
  lang: {
    label: "Langue",
    switchTo: "Changer de langue"
  },
  openingBanner: {
    message: "Ouverture bientôt"
  },
  nav: {
    main: "Navigation principale",
    menuDialog: "Menu de navigation",
    openMenu: "Ouvrir le menu de navigation",
    closeMenu: "Fermer le menu de navigation",
    goBack: "Retour",
    home: "Accueil",
    menu: "Carte",
    plancha: "Sur la Plancha",
    atmosphere: "Ambiance",
    club: "Club client",
    location: "Adresse & Horaires",
    about: "À propos",
    magazine: "Magazine",
    branches: "Adresses"
  },
  hero: {
    tagline: "Simplement un bon burger.",
    captionKicker: "REDÉFINIR L'EXPÉRIENCE BURGER",
    captionTitle: "NB BURGER",
    menuCta: "Voir la carte",
    orderCta: "Commander",
    scroll: "Défiler",
    scrollAria: "Défiler vers le bas",
    srTitle: `Burgers casher à ${BUSINESS.address.addressLocality}`
  },
  orderModal: {
    title: "Choisissez votre commande",
    close: "Fermer",
    pickup: "À emporter",
    delivery: "Livraison"
  },
  menuPage: {
    title: "Menu burgers casher à Raanana",
    categoryItemsHeading: "Plats de la catégorie",
    filterAll: "Tout",
    empty: "Aucun plat à afficher pour le moment.",
    viewLocations: "Voir nos adresses",
    heroAlt: "Plats de la carte NB BURGER",
    relatedCategories: "Autres catégories"
  },
  menuItemDetail: {
    orderNow: "Commander",
    galleryAria: "Photos du plat",
    closeUpAlt: "gros plan",
    backToMenu: "Retour à la carte",
    longSectionTitle: "À propos du plat",
    longSectionAria: "Description complète",
    allergyGuide: "Guide des allergènes",
    relatedItemsTitle: "Autres plats",
    relatedItemsLead: "De cette catégorie — trouvez votre prochaine bouchée.",
    relatedItemsAria: "Autres plats de la catégorie",
    viewBranchHours: "Voir le restaurant et les horaires d'ouverture"
  },
  aboutPage: {
    title: "À propos de NB BURGER",
    backHome: "Retour à l'accueil"
  },
  locations: {
    breadcrumbLabel: "Emplacements",
    pageTitle: "Adresse et horaires — NB BURGER Raanana",
    findLocal: "Trouver un restaurant",
    ourLocations: "Nos restaurants",
    mapTitle: "Carte des restaurants NB BURGER",
    mapSummary: "Carte NB BURGER — Raanana, Ahuzah 96",
    navigate: "Itinéraire",
    deliveryZonesTitle: "Zones de livraison",
    deliveryZones: [
      { name: "Ra'anana" },
      { name: "Kfar Saba" },
      { name: "Herzliya", areasNote: "zones sélectionnées" },
      { name: "Hod Hasharon", areasNote: "zones sélectionnées" },
      { name: "Ramot Hashavim" },
      { name: "Givat Hen" },
      { name: "Bitzra", areasNote: "zones sélectionnées" },
      { name: "Harutzim" }
    ],
    deliveryZonesNote:
      "Les livraisons sont effectuées dans un rayon d'environ 5 km du restaurant, selon l'adresse de commande et la disponibilité de la zone.",
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
    imageAlt: "Hamburger NB BURGER"
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
    bottomAlt: "Pain du bas",
    carouselSlideAlts: [
      "Burger NB BURGER sur papier brandé",
      "Burger NB BURGER juteux sur fond sombre",
      "Gros plan d'un burger NB BURGER avec sauce, cornichons et tomate"
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
      email: "E-mail",
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
    viewBranchDetails: "Tous les détails du restaurant",
    imageAlt: "Façade du restaurant",
    businessType: "Restaurant de burgers",
    kosher: "Casher — sous supervision rabbinique locale"
  },
  notFound: {
    title: "Page introuvable",
    description: "L'adresse a peut-être changé ou le lien est invalide.",
    backHome: "Retour à l'accueil"
  },
  forms: {
    optionalFieldNote: "optionnel"
  },
  contactForm: {
    title: "Envoyez-nous un message",
    lead: "Nous serons ravis de vous répondre — laissez vos coordonnées.",
    fullName: "Nom complet",
    phone: "Téléphone",
    email: "E-mail",
    message: "Message",
    submit: "Envoyer",
    submitting: "Envoi...",
    successTitle: "Message envoyé",
    successMessage: "Nous avons bien reçu votre message et reviendrons vers vous.",
    errors: {
      fullName: "Veuillez saisir votre nom complet.",
      phone: "Veuillez saisir votre numéro de téléphone.",
      email: "Veuillez saisir une adresse e-mail valide si renseignée.",
      message: "Veuillez saisir un message.",
      generic: "Une erreur est survenue. Veuillez réessayer."
    }
  },
  legal: {
    hebrewOnlyNotice: "Le texte juridique complet ci-dessous est en hébreu."
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
    accessibility: "Déclaration d'accessibilité",
    closing: "Pour chaque moment. Une bouchée inoubliable."
  },
  stories: {
    breadcrumbLabel: "Histoires",
    indexTitle: "Histoires",
    indexLead: "Dans les coulisses — constance, précision et expérience.",
    indexMetaTitle: "Histoires | NB BURGER",
    indexMetaDescription:
      "Courtes histoires de NB BURGER — sur le burger auquel on revient, la constance et l'expérience derrière chaque bouchée.",
    readStory: "Lire l'histoire",
    featuredLabel: "Histoire à la une",
    moreStories: "Plus d'histoires",
    empty: "Aucune histoire active pour le moment.",
    backToStories: "Retour aux histoires"
  }
};
