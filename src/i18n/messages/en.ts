import { BUSINESS } from "@/data/business";
import type { Messages } from "./types";

export const en: Messages = {
  a11y: {
    skipToMain: "Skip to main content"
  },
  lang: {
    label: "Language",
    switchTo: "Change language"
  },
  openingBanner: {
    message: "Opening soon"
  },
  nav: {
    main: "Main navigation",
    menuDialog: "Navigation menu",
    openMenu: "Open navigation menu",
    closeMenu: "Close navigation menu",
    home: "Home",
    menu: "Menu",
    plancha: "On the Plancha",
    atmosphere: "Atmosphere",
    club: "Customer Club",
    location: "Location & Hours",
    about: "About",
    branches: "Locations"
  },
  hero: {
    tagline: "Simply a good burger.",
    captionKicker: "REDEFINING THE BURGER EXPERIENCE",
    captionTitle: "NB BURGER",
    menuCta: "View Menu",
    orderCta: "Order Now",
    scroll: "Scroll",
    scrollAria: "Scroll down"
  },
  orderModal: {
    title: "Choose how to order",
    close: "Close",
    pickup: "Click & Collect",
    delivery: "Delivery"
  },
  menuPage: {
    title: "Our Menu",
    filterAll: "All",
    empty: "No dishes to show right now.",
    viewLocations: "View Our Locations",
    heroAlt: "Dishes from the NB BURGER menu"
  },
  menuItemDetail: {
    orderNow: "Order Now",
    galleryAria: "Dish photos",
    closeUpAlt: "close-up",
    backToMenu: "Back to menu",
    longSectionAria: "Full description",
    allergyGuide: "Allergy Guide"
  },
  locations: {
    findLocal: "FIND MY LOCAL",
    ourLocations: "OUR LOCATIONS",
    mapTitle: "NB BURGER locations map",
    navigate: "Navigate",
    deliveryZonesTitle: "Delivery areas",
    deliveryZones: ["Hod Hasharon", "Kfar Saba", "Ra'anana"],
    backHome: "Back to home"
  },
  menuShowcase: {
    title: "Our Menu",
    lead: "Burgers, fries, shakes and more!",
    trackAria: "Menu highlights",
    bestSeller: "Best Seller",
    fullMenu: "View Full Menu",
    prev: "Previous dishes",
    next: "Next dishes"
  },
  homeStory: {
    title: "Not just another burger.",
    imageAlt: "NB BURGER hamburger",
    intro: "At NB BURGER, we believe quality doesn't need a long explanation.",
    punchLines: [
      "Premium beef, ground in-house every day.",
      "Fresh brioche buns.",
      "House-made sauces.",
      "Ingredients chosen with care."
    ],
    closing: [
      "Every burger is seared to order and served exactly as it should be — juicy, precise, and uncompromising.",
      "Because in the end, you don't need to reinvent the burger.",
      "Just make it the way it should be."
    ]
  },
  plancha: {
    title: "On the Plancha",
    lead: "Fresh beef, ground in-house, straight onto the heat.",
    listAria: "Burger steps on the plancha",
    steps: [
      {
        title: "The Meat",
        desc: "Ground on site, seasoned with care, and placed on the plancha fresh and precise."
      },
      {
        title: "The Sear",
        desc: "High heat, a bold sear, and a crust that gives the bite its character."
      },
      {
        title: "The Bite",
        desc: "A soft bun, fresh vegetables, and a sauce that ties it all together."
      }
    ]
  },
  atmosphere: {
    title: "The Atmosphere",
    leadLine1: "Great food, music in the background,",
    leadLine2: "and people you actually want to sit with.",
    introTitle: "Art between two buns.",
    introLead: "A premium patty from selected butchers, ground fresh on site every day.",
    droneAlt: "Drone footage",
    burgerStackAlt: "Deconstructed burger",
    bottomAlt: "Bottom bun"
  },
  faq: {
    kicker: "FAQ",
    title: "Questions & Answers",
    lead: "Everything worth knowing before your next bite.",
    items: [
      {
        question: "Where can I eat a kosher burger in Ra'anana?",
        answer:
          "NB BURGER offers a kosher burger experience in Ra'anana, with juicy burgers, quality ingredients, and dishes prepared on site. You can dine in or order delivery."
      },
      {
        question: "What kashrut certification does NB BURGER have?",
        answer:
          "NB BURGER is a kosher restaurant under rabbinical supervision. Our meat menu is suited for those who keep kosher and includes a variety of burgers and more."
      },
      {
        question: "What makes the NB BURGER smash burger special?",
        answer:
          "Our smash burger is based on a beef patty seared on a hot surface for deep browning and rich flavor, served with toppings and sauces that complete the bite."
      },
      {
        question: "Can I order burger delivery from NB BURGER?",
        answer:
          "Yes. You can order delivery from NB BURGER in Ra'anana and available delivery areas, and enjoy our dishes at home or at work."
      },
      {
        question: "What are NB BURGER opening hours?",
        answer:
          "Opening hours may change by day and holidays. We recommend checking the updated hours on the website before arriving or placing an order."
      },
      {
        question: "What's on the NB BURGER menu?",
        answer:
          "You'll find a variety of burgers, smash burgers, sides, extras, and sauces. You can view the full menu on the website and choose what suits you."
      }
    ]
  },
  customerClub: {
    kicker: "NB CLUB",
    title: "Customer Club",
    titlePrimary: "Customer",
    titleAccent: "Club",
    lead: "Exclusive perks, special offers, and a burger experience on another level",
    leadBefore: "",
    leadHighlight: "",
    leadAfter: "",
    cardAlt: "NB Club member card",
    burgerAlt: "NB burger",
    formTitle: "Join now",
    formSubtitle: "And unlock a world of benefits",
    formHint: "Quick signup",
    socialProof: "2,300+ members",
    trustSafe: "Your info stays with us",
    trustTerms: "Free · No commitment",
    barBrandSub: "REAL BURGERS. REAL PEOPLE.",
    barSlogan: "NB CLUB — MORE THAN A BURGER",
    perksAria: "Club benefits",
    features: [
      { title: "Exclusive offers" },
      { title: "Personal perks" },
      { title: "Birthday gift" }
    ],
    perks: [
      { title: "Birthday treat", desc: "" },
      { title: "First to know", desc: "" },
      { title: "Exclusive perks", desc: "" }
    ],
    formPerks: [
      { title: "Members only", desc: "Exclusive benefits" },
      { title: "Special deals", desc: "Real discounts" },
      { title: "Another level", desc: "Food done right" }
    ],
    fields: {
      fullName: "Full name",
      phone: "Phone",
      email: "Email (optional)",
      birthDate: "Birth date"
    },
    consentPrefix: "I agree to receive updates and gifts",
    privacyLink: "Privacy",
    submit: "Join now",
    submitting: "Sending...",
    successTitle: "You're in!",
    successMessage: "We'll be in touch with your perks soon.",
    errors: {
      fullName: "Please enter your full name.",
      phone: "Please enter your phone number.",
      email: "Please enter a valid email address if provided.",
      consent: "Please accept the club terms to continue.",
      generic: "Something went wrong. Please try again."
    },
    datePicker: {
      year: "Year",
      month: "Month",
      day: "Day",
      yearPlaceholder: "Select year",
      monthPlaceholder: "Select month",
      dayPlaceholder: "Select day",
      prevMonth: "Previous month",
      nextMonth: "Next month",
      pickYear: "Pick a year",
      pickMonth: "Pick a month"
    }
  },
  location: {
    title: "Location & Hours",
    locationHeading: "Location",
    address: BUSINESS.address.formatted.en,
    parking: "Plenty of free parking",
    hoursHeading: "Opening Hours",
    days: {
      sunThu: "Sun - Thu",
      fri: "Friday",
      sat: "Saturday"
    },
    hours: {
      sunThu: BUSINESS.displayHours.weekday,
      sat: BUSINESS.displayHours.saturday
    },
    navigate: "Get Directions",
    imageAlt: "Restaurant exterior"
  },
  footer: {
    taglineLine1: "Beef ground in-house,",
    taglineLine2: "a hot plancha, a bite built right.",
    contact: "Contact",
    followUs: "Follow Us",
    mapAria: "Map location",
    nav: "Navigation",
    menu: "Menu",
    fullMenu: "Full Menu",
    copyright: "© 2026 NB BURGER - All rights reserved",
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    closing: "Any occasion, any hour. A bite you won't forget."
  }
};
