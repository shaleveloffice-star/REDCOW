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
    goBack: string;
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
    srTitle: string;
  };
  orderModal: {
    title: string;
    close: string;
    pickup: string;
    delivery: string;
  };
  menuPage: {
    title: string;
    categoryItemsHeading: string;
    filterAll: string;
    empty: string;
    viewLocations: string;
    heroAlt: string;
    relatedCategories: string;
  };
  menuItemDetail: {
    orderNow: string;
    galleryAria: string;
    closeUpAlt: string;
    backToMenu: string;
    longSectionTitle: string;
    longSectionAria: string;
    allergyGuide: string;
    relatedItemsTitle: string;
    relatedItemsLead: string;
    relatedItemsAria: string;
    viewBranchHours: string;
  };
  aboutPage: {
    title: string;
    backHome: string;
  };
  locations: {
    breadcrumbLabel: string;
    pageTitle: string;
    findLocal: string;
    ourLocations: string;
    mapTitle: string;
    mapSummary: string;
    navigate: string;
    deliveryZonesTitle: string;
    deliveryZones: ReadonlyArray<{ name: string; areasNote?: string }>;
    deliveryZonesNote: string;
    backHome: string;
  };
  notFound: {
    title: string;
    description: string;
    backHome: string;
  };
  forms: {
    optionalFieldNote: string;
  };
  contactForm: {
    title: string;
    lead: string;
    fullName: string;
    phone: string;
    email: string;
    message: string;
    submit: string;
    submitting: string;
    successTitle: string;
    successMessage: string;
    errors: {
      fullName: string;
      phone: string;
      email: string;
      message: string;
      generic: string;
    };
  };
  legal: {
    hebrewOnlyNotice: string;
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
    carouselSlideAlts: [string, string, string];
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
    viewBranchDetails: string;
    imageAlt: string;
    businessType: string;
    kosher: string;
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
  stories: {
    breadcrumbLabel: string;
    indexTitle: string;
    indexLead: string;
    indexMetaTitle: string;
    indexMetaDescription: string;
    readStory: string;
    featuredLabel: string;
    moreStories: string;
    empty: string;
    backToStories: string;
  };
};
