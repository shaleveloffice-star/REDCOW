export type PlanchaStepMessage = {
  title: string;
  desc: string;
};

export type Messages = {
  lang: {
    label: string;
    switchTo: string;
  };
  nav: {
    main: string;
    openMenu: string;
    closeMenu: string;
    home: string;
    menu: string;
    plancha: string;
    atmosphere: string;
    location: string;
  };
  hero: {
    tagline: string;
    menuCta: string;
    orderCta: string;
    scroll: string;
    scrollAria: string;
  };
  menuShowcase: {
    title: string;
    lead: string;
    trackAria: string;
    bestSeller: string;
    fullMenu: string;
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
    burgerAria: string;
    wideAlt: string;
    peopleAlt: string;
    signAlt: string;
    droneAlt: string;
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
      fri: string;
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
  shortTour: {
    trigger: string;
    triggerAria: string;
    dialogAria: string;
    skip: string;
    steps: string[];
  };
};
