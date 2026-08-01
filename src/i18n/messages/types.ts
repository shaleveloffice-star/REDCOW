export type PlanchaStepMessage = {
  title: string;
  desc: string;
};

export type Messages = {
  a11y: {
    skipToMain: string;
  };
  lang: {
    label: string;
    switchTo: string;
  };
  openingBanner: {
    message: string;
  };
  nav: {
    main: string;
    menuDialog: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    menu: string;
    plancha: string;
    atmosphere: string;
    club: string;
    location: string;
    about: string;
    branches: string;
  };
  hero: {
    tagline: string;
    captionKicker: string;
    captionTitle: string;
    menuCta: string;
    orderCta: string;
    scroll: string;
    scrollAria: string;
  };
  orderModal: {
    title: string;
    close: string;
    pickup: string;
    delivery: string;
  };
  menuPage: {
    title: string;
    filterAll: string;
    empty: string;
    viewLocations: string;
    heroAlt: string;
  };
  menuItemDetail: {
    orderNow: string;
    galleryAria: string;
    closeUpAlt: string;
    backToMenu: string;
    longSectionAria: string;
    allergyGuide: string;
  };
  locations: {
    findLocal: string;
    ourLocations: string;
    mapTitle: string;
    navigate: string;
    deliveryZonesTitle: string;
    deliveryZones: string[];
    backHome: string;
  };
  menuShowcase: {
    title: string;
    lead: string;
    trackAria: string;
    bestSeller: string;
    fullMenu: string;
    prev: string;
    next: string;
  };
  homeStory: {
    imageAlt: string;
  };
  plancha: {
    title: string;
    lead: string;
    listAria: string;
    steps: PlanchaStepMessage[];
  };
  atmosphere: {
    title: string;
    leadLine1: string;
    leadLine2: string;
    introTitle: string;
    introLead: string;
    droneAlt: string;
    burgerStackAlt: string;
    bottomAlt: string;
  };
  customerClub: {
    kicker: string;
    title: string;
    titlePrimary: string;
    titleAccent: string;
    lead: string;
    leadBefore: string;
    leadHighlight: string;
    leadAfter: string;
    cardAlt: string;
    burgerAlt: string;
    formTitle: string;
    formSubtitle: string;
    formHint: string;
    socialProof: string;
    trustSafe: string;
    trustTerms: string;
    barBrandSub: string;
    barSlogan: string;
    perksAria: string;
    features: Array<{ title: string }>;
    perks: Array<{ title: string; desc: string }>;
    formPerks: Array<{ title: string; desc: string }>;
    fields: {
      fullName: string;
      phone: string;
      email: string;
      birthDate: string;
    };
    consentPrefix: string;
    privacyLink: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    errors: {
      fullName: string;
      phone: string;
      email: string;
      consent: string;
      generic: string;
    };
    datePicker: {
      year: string;
      month: string;
      day: string;
      yearPlaceholder: string;
      monthPlaceholder: string;
      dayPlaceholder: string;
      prevMonth: string;
      nextMonth: string;
      pickYear: string;
      pickMonth: string;
    };
  };
  location: {
    title: string;
    locationHeading: string;
    address: string;
    parking: string;
    hoursHeading: string;
    days: {
      sunThu: string;
      fri: string;
      sat: string;
    };
    hours: {
      sunThu: string;
      /** Omitted when Friday hours are not approved */
      fri?: string;
      sat: string;
    };
    navigate: string;
    imageAlt: string;
  };
  footer: {
    taglineLine1: string;
    taglineLine2: string;
    contact: string;
    followUs: string;
    mapAria: string;
    nav: string;
    menu: string;
    fullMenu: string;
    copyright: string;
    privacy: string;
    terms: string;
    closing: string;
  };
};
