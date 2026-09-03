import { BUSINESS } from "@/data/business";
import type { Messages } from "./types";

export const en: Messages = {
  a11y: {
    skipToMain: "Skip to main content",
    pauseVideo: "Pause video",
    playVideo: "Play video",
    openWidget: "Accessibility",
    closeWidget: "Close accessibility menu",
    widgetTitle: "Accessibility options",
    textSize: "Text size",
    increaseText: "Larger",
    decreaseText: "Smaller",
    highContrast: "High contrast",
    highlightLinks: "Highlight links",
    reduceMotion: "Reduce motion",
    reset: "Reset"
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
    goBack: "Back",
    home: "Home",
    menu: "Menu",
    plancha: "On the Plancha",
    atmosphere: "Atmosphere",
    club: "Customer Club",
    location: "Location & Hours",
    about: "About",
    magazine: "Magazine",
    branches: "Locations"
  },
  hero: {
    tagline: "Simply a good burger.",
    captionKicker: "REDEFINING THE BURGER EXPERIENCE",
    captionTitle: "NB BURGER",
    menuCta: "View Menu",
    orderCta: "Order Now",
    scroll: "Scroll",
    scrollAria: "Scroll down",
    srTitle: `Burgers in ${BUSINESS.address.addressLocality}`
  },
  orderModal: {
    title: "Choose how to order",
    close: "Close",
    pickup: "Click & Collect",
    delivery: "Delivery"
  },
  menuPage: {
    title: "Kosher Burger Menu in Raanana",
    categoryItemsHeading: "Dishes in this category",
    filterAll: "All",
    empty: "No dishes to show right now.",
    viewLocations: "View Our Locations",
    heroAlt: "Dishes from the NB BURGER menu",
    relatedCategories: "More categories"
  },
  menuItemDetail: {
    orderNow: "Order Now",
    galleryAria: "Dish photos",
    closeUpAlt: "close-up",
    backToMenu: "Back to menu",
    longSectionTitle: "About this dish",
    longSectionAria: "Full description",
    allergyGuide: "Allergy Guide",
    relatedItemsTitle: "More dishes",
    relatedItemsLead: "From this category — discover your next bite.",
    relatedItemsAria: "More dishes from this category",
    viewBranchHours: "View branch location and opening hours"
  },
  aboutPage: {
    title: "About NB BURGER",
    backHome: "Back to home"
  },
  locations: {
    breadcrumbLabel: "Locations",
    pageTitle: "Location & Hours — NB BURGER Raanana",
    findLocal: "FIND MY LOCAL",
    ourLocations: "OUR LOCATIONS",
    mapTitle: "NB BURGER locations map",
    mapSummary: "NB BURGER branch map — Raanana, Ahuzah 96",
    navigate: "Navigate",
    deliveryZonesTitle: "Delivery areas",
    deliveryZones: [
      { name: "Ra'anana" },
      { name: "Kfar Saba" },
      { name: "Herzliya", areasNote: "selected areas" },
      { name: "Hod Hasharon", areasNote: "selected areas" },
      { name: "Ramot Hashavim" },
      { name: "Givat Hen" },
      { name: "Bitzra", areasNote: "selected areas" },
      { name: "Harutzim" }
    ],
    deliveryZonesNote:
      "Deliveries are made within approximately 5 km of the branch, depending on the delivery address and zone availability.",
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
    imageAlt: "NB BURGER hamburger"
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
    bottomAlt: "Bottom bun",
    carouselSlideAlts: [
      "NB BURGER burger on branded paper",
      "Juicy NB BURGER burger on a dark background",
      "Close-up of an NB BURGER burger with sauce, pickles and tomato"
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
      email: "Email",
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
    parking: "Free parking available from evening hours",
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
    viewBranchDetails: "Full branch details",
    imageAlt: "Restaurant exterior",
    businessType: "Burger restaurant",
    kosher: "Kosher — local rabbinate supervision"
  },
  notFound: {
    title: "Page not found",
    description: "The address may have changed or the link is invalid.",
    backHome: "Back to home"
  },
  forms: {
    optionalFieldNote: "optional"
  },
  contactForm: {
    title: "Send us a message",
    lead: "We'd love to help — leave your details and we'll get back to you.",
    fullName: "Full name",
    phone: "Phone",
    email: "Email",
    message: "Message",
    submit: "Send",
    submitting: "Sending...",
    successTitle: "Message sent",
    successMessage: "We received your message and will reply soon.",
    errors: {
      fullName: "Please enter your full name.",
      phone: "Please enter your phone number.",
      email: "Please enter a valid email address if provided.",
      message: "Please enter a message.",
      generic: "Something went wrong. Please try again."
    }
  },
  legal: {
    hebrewOnlyNotice: "The full legal text below is provided in Hebrew."
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
    accessibility: "Accessibility Statement",
    closing: "Any occasion, any hour. A bite you won't forget."
  },
  stories: {
    breadcrumbLabel: "Stories",
    indexTitle: "Stories",
    indexLead: "Behind the scenes — consistency, precision, and experience.",
    indexMetaTitle: "Stories | NB BURGER",
    indexMetaDescription:
      "Short stories from NB BURGER — about the burger you come back for, the consistency, and the experience behind every bite.",
    readStory: "Read the story",
    featuredLabel: "Featured story",
    moreStories: "More stories",
    empty: "No active stories at the moment.",
    backToStories: "Back to stories"
  }
};
