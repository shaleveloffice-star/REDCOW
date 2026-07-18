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
    menuCta: "View Menu",
    orderCta: "Order Now",
    scroll: "Scroll",
    scrollAria: "Scroll down"
  },
  menuShowcase: {
    title: "The Menu",
    lead: "The NB standard, elevated.",
    trackAria: "Menu highlights",
    bestSeller: "Best Seller",
    fullMenu: "Full Menu",
    prev: "Previous dishes",
    next: "Next dishes"
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
  customerClub: {
    kicker: "NB Club",
    title: "Customer Club",
    titlePrimary: "Customer",
    titleAccent: "Club",
    leadBefore: "Join the club for ",
    leadHighlight: "perks, updates, and surprises",
    leadAfter: " before anyone else.",
    cardAlt: "NB Club member card",
    burgerAlt: "NB burger",
    formHint: "Sign up in just 10 seconds",
    socialProof: "Over 2,300 club members already enjoying the perks",
    trustSafe: "Your information is safe with us",
    trustTerms: "No cost | No commitment | Cancel anytime",
    perksAria: "Club benefits",
    perks: [
      {
        title: "Birthday treat",
        desc: "A sweet surprise from our kitchen, right on your day."
      },
      {
        title: "First to know",
        desc: "Early access to new dishes and special campaigns."
      },
      {
        title: "Exclusive perks",
        desc: "Deals and updates sent straight to you — no spam."
      }
    ],
    fields: {
      fullName: "Full name",
      phone: "Phone",
      email: "Email (optional)",
      birthDate: "Birth date (optional)"
    },
    consentPrefix: "I agree to receive club updates and perks according to the",
    privacyLink: "Privacy Policy",
    submit: "Get my perks",
    submitting: "Sending...",
    successTitle: "Welcome to the club!",
    successMessage: "We received your signup. We'll be in touch as soon as everything is ready.",
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
  },
  shortTour: {
    trigger: "Quick Tour",
    triggerAria: "Start a quick site tour",
    dialogAria: "Quick site tour",
    skip: "Skip tour",
    steps: ["Welcome", "Our Menu", "The Vibe", "On the Plancha", "Find Us", "Order Now"]
  }
};
