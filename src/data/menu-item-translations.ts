export type MenuItemTranslationEntry = {
  en: { name: string; description: string; longDescription?: string };
  fr: { name: string; description: string; longDescription?: string };
};

export const MENU_ITEM_TRANSLATIONS: Record<string, MenuItemTranslationEntry> = {
  "item-nb-burger-klasi": {
    en: {
      name: "NB Classic Burger",
      description: "Beef patty on the plancha, lettuce, tomato, red onion, and house sauce.",
      longDescription:
        "The NB BURGER classic in Ra'anana — freshly ground beef seared on the plancha for a perfect crust, served in a soft bun with crisp vegetables and house sauce. Kosher burger restaurant on Ahuzah Street 96."
    },
    fr: {
      name: "Burger NB Classic",
      description:
        "Steak haché sur la plancha, laitue, tomate, oignon rouge et sauce maison.",
      longDescription:
        "Le classique de NB BURGER à Ra'anana — bœuf fraîchement haché sur place, saisi sur la plancha pour une croûte parfaite, servi dans un bun moelleux avec légumes frais et sauce maison. Restaurant de burgers casher, 96 rue Ahuzah."
    }
  },
  "item-nb-burger-kamhin": {
    en: {
      name: "NB Truffle Burger",
      description: "Beef patty, truffle aioli, lettuce, tomato, red onion, and cheese.",
      longDescription:
        "The NB Truffle Burger pairs a juicy plancha-seared patty with rich truffle aioli, melted cheese, and fresh vegetables. A premium burger experience in Ra'anana — NB BURGER, kosher burger restaurant."
    },
    fr: {
      name: "Burger NB Truffe",
      description:
        "Steak haché, aïoli à la truffe, laitue, tomate, oignon rouge et fromage.",
      longDescription:
        "Le burger NB Truffe associe un steak juteux saisi sur la plancha à un aïoli truffé onctueux, fromage fondant et légumes frais. Une expérience burger premium à Ra'anana — NB BURGER, restaurant de burgers casher."
    }
  },
  "item-nb-burger-konfi": {
    en: {
      name: "NB Confit Burger",
      description:
        "Beef patty, confit garlic aioli, lettuce, tomato, caramelized onion, and cheese.",
      longDescription:
        "The NB Confit Burger — a plancha-seared beef patty with aromatic confit garlic aioli, sweet caramelized onion, and melted cheese. Deep, precise flavor from NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Burger NB Confit",
      description:
        "Steak haché, aïoli à l'ail confit, laitue, tomate, oignon caramélisé et fromage.",
      longDescription:
        "Le burger NB Confit — steak haché saisi sur la plancha, aïoli à l'ail confit aromatique, oignon caramélisé sucré et fromage fondant. Une saveur profonde et précise signée NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-nb-burger-vegan": {
    en: {
      name: "NB Vegan Burger",
      description:
        "Vegan patty on the plancha, lettuce, tomato, red onion, pickles, and house sauce.",
      longDescription:
        "The NB Vegan Burger — a plant-based patty seared on the plancha with fresh vegetables and house sauce in a soft bun. A fully vegan option at NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Burger NB Végétalien",
      description:
        "Steak végétal sur la plancha, laitue, tomate, oignon rouge, cornichons et sauce maison.",
      longDescription:
        "Le burger NB Végétalien — galette végétale saisie sur la plancha avec légumes frais et sauce maison, dans un bun moelleux. Option 100 % végétalienne chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-meal-nb-klasi": {
    en: {
      name: "NB Classic Meal",
      description: "NB Classic Burger, choice of side, and soft drink.",
      longDescription:
        "The NB Classic Meal — our classic burger with a side of your choice and a soft drink. A complete, satisfying meal from NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Formule NB Classic",
      description: "Burger NB Classic, accompagnement au choix et boisson.",
      longDescription:
        "La formule NB Classic — notre burger classique avec un accompagnement au choix et une boisson. Un repas complet et copieux chez NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-meal-nb-kamhin": {
    en: {
      name: "NB Truffle Meal",
      description: "NB Truffle Burger, choice of side, and soft drink.",
      longDescription:
        "The NB Truffle Meal — truffle aioli burger with a side of your choice and a soft drink. A complete meal from NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Formule NB Truffe",
      description: "Burger NB Truffe, accompagnement au choix et boisson.",
      longDescription:
        "La formule NB Truffe — burger à l'aïoli truffé, accompagnement au choix et boisson. Un repas complet chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-side-fries": {
    en: {
      name: "Fries",
      description: "Crispy fries with house seasoning.",
      longDescription:
        "Golden, crispy fries with house seasoning — the classic side alongside your burger at NB BURGER Ra'anana. Perfect with any item on the menu."
    },
    fr: {
      name: "Frites",
      description: "Frites croustillantes avec assaisonnement maison.",
      longDescription:
        "Frites dorées et croustillantes avec assaisonnement maison — l'accompagnement classique du burger chez NB BURGER Ra'anana. Parfaites avec n'importe quel plat du menu."
    }
  },
  "item-side-home-fries": {
    en: {
      name: "Home Fries",
      description: "Cut potatoes, fried and seasoned.",
      longDescription:
        "Home fries — fried, seasoned potato slices, crispy outside and tender inside. An excellent side from NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Pommes de terre maison",
      description: "Pommes de terre coupées, frites et assaisonnées.",
      longDescription:
        "Pommes de terre maison — tranches de pommes de terre frites et assaisonnées, croustillantes à l'extérieur et fondantes à l'intérieur. Un excellent accompagnement chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-side-wings": {
    en: {
      name: "Wings",
      description: "Juicy wings with sauce of your choice.",
      longDescription:
        "Juicy, crispy wings served with sauce of your choice. Perfect for sharing or as a side alongside your burger — NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Ailes de poulet",
      description: "Ailes juteuses avec sauce au choix.",
      longDescription:
        "Ailes juteuses et croustillantes, servies avec sauce au choix. Parfaites à partager ou en accompagnement du burger — NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-side-nuggets-4": {
    en: {
      name: "4 Chicken Nuggets",
      description: "4 crispy chicken nuggets, served with sauce of your choice.",
      longDescription:
        "4 golden, crispy chicken nuggets served with sauce of your choice. A light, tasty side from NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "4 Nuggets de poulet",
      description: "4 nuggets de poulet croustillants, servis avec sauce au choix.",
      longDescription:
        "4 nuggets de poulet dorés et croustillants, servis avec sauce au choix. Un accompagnement léger et savoureux chez NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-side-nuggets-7": {
    en: {
      name: "7 Chicken Nuggets",
      description: "7 crispy chicken nuggets, served with sauce of your choice.",
      longDescription:
        "7 crispy chicken nuggets — a larger portion for sharing or a big appetite. From NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "7 Nuggets de poulet",
      description: "7 nuggets de poulet croustillants, servis avec sauce au choix.",
      longDescription:
        "7 nuggets de poulet croustillants — une portion plus généreuse à partager ou pour les grandes faims. Chez NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-salad-green": {
    en: {
      name: "Green Salad",
      description: "Baby greens, cucumber, tomato, red onion, and dressing of your choice.",
      longDescription:
        "Fresh green salad with baby greens, chopped vegetables, and dressing of your choice. A light, refreshing option alongside your burger — NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Salade verte",
      description:
        "Jeunes pousses, concombre, tomate, oignon rouge et vinaigrette au choix.",
      longDescription:
        "Salade verte fraîche avec jeunes pousses, légumes coupés et vinaigrette au choix. Une option légère et rafraîchissante à côté du burger — NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-salad-caesar-small": {
    en: {
      name: "Small Caesar Salad",
      description: "Romaine lettuce, croutons, Parmesan, and Caesar dressing.",
      longDescription:
        "Small Caesar salad — crisp lettuce, croutons, Parmesan, and classic Caesar dressing. Perfect as a starter or alongside your burger — NB BURGER Ra'anana."
    },
    fr: {
      name: "Petite salade César",
      description: "Laitue romaine, croûtons, parmesan et sauce César.",
      longDescription:
        "Petite salade César — laitue croquante, croûtons, parmesan et sauce César classique. Parfaite en entrée ou en accompagnement du burger — NB BURGER Ra'anana."
    }
  },
  "item-salad-caesar-large": {
    en: {
      name: "Large Caesar Salad",
      description: "Romaine lettuce, croutons, Parmesan, and Caesar dressing — large portion.",
      longDescription:
        "Large Caesar salad — a hearty portion with romaine lettuce, croutons, Parmesan, and Caesar dressing. NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Grande salade César",
      description:
        "Laitue romaine, croûtons, parmesan et sauce César — grande portion.",
      longDescription:
        "Grande salade César — portion généreuse avec laitue romaine, croûtons, parmesan et sauce César. NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-sauce-aioli-konfi": {
    en: {
      name: "Confit Garlic Aioli",
      description: "House-made aioli with confit garlic.",
      longDescription:
        "House-made confit garlic aioli — a rich, aromatic sauce that elevates any burger. From NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Aïoli à l'ail confit",
      description: "Aïoli maison à l'ail confit.",
      longDescription:
        "Aïoli maison à l'ail confit — sauce riche et aromatique qui sublime chaque burger. Chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-sauce-aioli-honey-mustard": {
    en: {
      name: "Honey Mustard Aioli",
      description: "Sweet aioli with honey and mustard.",
      longDescription:
        "Honey mustard aioli — a sweet and tangy blend that pairs well with sides and burgers. From NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Aïoli miel-moutarde",
      description: "Aïoli sucré au miel et à la moutarde.",
      longDescription:
        "Aïoli miel-moutarde — un mélange sucré et piquant qui accompagne parfaitement les accompagnements et les burgers. Chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-sauce-aioli-kamhin": {
    en: {
      name: "Truffle Aioli",
      description: "Rich, creamy truffle aioli.",
      longDescription:
        "Truffle aioli — a rich, creamy sauce with truffle aroma, perfect alongside burgers or sides. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Aïoli à la truffe",
      description: "Aïoli truffé riche et crémeux.",
      longDescription:
        "Aïoli à la truffe — sauce crémeuse et onctueuse aux arômes de truffe, parfaite avec les burgers ou les accompagnements. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-sauce-aioli-mint": {
    en: {
      name: "Mint Aioli",
      description: "Refreshing aioli with mint.",
      longDescription:
        "Mint aioli — a fresh, light sauce that balances the richness of the burger. From NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Aïoli à la menthe",
      description: "Aïoli rafraîchissant à la menthe.",
      longDescription:
        "Aïoli à la menthe — sauce fraîche et légère qui équilibre la richesse du burger. Chez NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-sauce-aioli-chipotle": {
    en: {
      name: "Chipotle Aioli",
      description: "Smoky, spicy aioli with chipotle.",
      longDescription:
        "Chipotle aioli — a smoky, spicy sauce for lovers of bold flavor. From NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Aïoli chipotle",
      description: "Aïoli fumé et épicé au chipotle.",
      longDescription:
        "Aïoli chipotle — sauce fumée et épicée pour les amateurs de saveurs intenses. Chez NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-sauce-ketchup": {
    en: {
      name: "Ketchup",
      description: "Classic ketchup.",
      longDescription:
        "Classic ketchup — the essential sauce for fries, nuggets, and every side. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Ketchup",
      description: "Ketchup classique.",
      longDescription:
        "Ketchup classique — la sauce incontournable pour les frites, nuggets et tous les accompagnements. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-sauce-mayo": {
    en: {
      name: "Mayonnaise",
      description: "Classic mayonnaise.",
      longDescription:
        "Classic mayonnaise — a smooth, familiar sauce that pairs with any dish. NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Mayonnaise",
      description: "Mayonnaise classique.",
      longDescription:
        "Mayonnaise classique — sauce onctueuse et familière qui accompagne tous les plats. NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-drink-water": {
    en: {
      name: "Mineral Water",
      description: "Bottle of mineral water.",
      longDescription:
        "Chilled mineral water — the perfect drink alongside your burger. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Eau minérale",
      description: "Bouteille d'eau minérale.",
      longDescription:
        "Eau minérale fraîche — la boisson idéale à côté du burger. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-soda": {
    en: {
      name: "Soda Water",
      description: "Sparkling soda water.",
      longDescription:
        "Chilled sparkling soda water — a refreshing drink alongside your burger. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Eau gazeuse",
      description: "Eau gazeuse pétillante.",
      longDescription:
        "Eau gazeuse fraîche et pétillante — boisson rafraîchissante à côté du burger. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-lemonade": {
    en: {
      name: "Lemonade",
      description: "Chilled, refreshing lemonade.",
      longDescription:
        "Chilled, refreshing lemonade — the perfect drink alongside your burger on warm days. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Limonade",
      description: "Limonade fraîche et rafraîchissante.",
      longDescription:
        "Limonade fraîche et rafraîchissante — la boisson parfaite à côté du burger par temps chaud. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-cola": {
    en: {
      name: "Coca-Cola",
      description: "Coca-Cola.",
      longDescription:
        "Ice-cold Coca-Cola — the classic pairing with any meal. NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Coca-Cola",
      description: "Coca-Cola.",
      longDescription:
        "Coca-Cola bien frais — l'accord classique avec tout repas. NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-drink-cola-zero": {
    en: {
      name: "Coca-Cola Zero",
      description: "Coca-Cola Zero.",
      longDescription:
        "Coca-Cola Zero — same great taste, zero sugar. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Coca-Cola Zero",
      description: "Coca-Cola Zero.",
      longDescription:
        "Coca-Cola Zero — le même goût, sans sucre. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-sprite": {
    en: {
      name: "Sprite",
      description: "Sprite.",
      longDescription:
        "Sparkling, refreshing Sprite — a lemon-lime drink alongside your burger. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Sprite",
      description: "Sprite.",
      longDescription:
        "Sprite pétillant et rafraîchissant — boisson citron-lime à côté du burger. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-sprite-zero": {
    en: {
      name: "Sprite Zero",
      description: "Sprite Zero.",
      longDescription:
        "Sprite Zero — lemon-lime refreshment with zero sugar. NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Sprite Zero",
      description: "Sprite Zero.",
      longDescription:
        "Sprite Zero — fraîcheur citron-lime sans sucre. NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-fanta": {
    en: {
      name: "Fanta Orange",
      description: "Fanta orange soda.",
      longDescription:
        "Fanta orange — a sweet, fizzy drink alongside your burger. NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Fanta Orange",
      description: "Fanta orange.",
      longDescription:
        "Fanta orange — boisson gazeuse sucrée à côté du burger. NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-drink-grape": {
    en: {
      name: "Grape Drink",
      description: "Grape-flavored soft drink.",
      longDescription:
        "Sweet, refreshing grape drink — NB BURGER, Ra'anana's burger restaurant."
    },
    fr: {
      name: "Boisson raisin",
      description: "Boisson au goût raisin.",
      longDescription:
        "Boisson raisin sucrée et rafraîchissante — NB BURGER, restaurant de burgers à Ra'anana."
    }
  },
  "item-drink-fuzetea": {
    en: {
      name: "Fuze Tea",
      description: "Fuze Tea iced tea.",
      longDescription:
        "Fuze Tea — refreshing iced tea alongside your burger. NB BURGER, kosher burger restaurant in Ra'anana."
    },
    fr: {
      name: "Fuze Tea",
      description: "Thé glacé Fuze Tea.",
      longDescription:
        "Fuze Tea — thé glacé rafraîchissant à côté du burger. NB BURGER, restaurant de burgers casher à Ra'anana."
    }
  },
  "item-beer-corona": {
    en: {
      name: "Corona (Bottle)",
      description: "Corona beer in a bottle.",
      longDescription:
        "Corona beer in a bottle — alongside your burger at NB BURGER, Ra'anana's burger restaurant. 18+ only."
    },
    fr: {
      name: "Corona (bouteille)",
      description: "Bière Corona en bouteille.",
      longDescription:
        "Bière Corona en bouteille — à côté du burger chez NB BURGER, restaurant de burgers à Ra'anana. Réservé aux 18 ans et plus."
    }
  },
  "item-beer-stella": {
    en: {
      name: "Stella Artois (Bottle)",
      description: "Stella Artois beer in a bottle.",
      longDescription:
        "Stella Artois beer in a bottle — a winning pairing with your burger. NB BURGER, Ra'anana's burger restaurant. 18+."
    },
    fr: {
      name: "Stella Artois (bouteille)",
      description: "Bière Stella Artois en bouteille.",
      longDescription:
        "Bière Stella Artois en bouteille — l'accord parfait avec le burger. NB BURGER, restaurant de burgers à Ra'anana. 18+."
    }
  },
  "item-beer-heineken": {
    en: {
      name: "Heineken (Bottle)",
      description: "Heineken beer in a bottle.",
      longDescription:
        "Heineken beer in a bottle — the perfect drink alongside your burger meal. NB BURGER, Ra'anana's burger restaurant. 18+."
    },
    fr: {
      name: "Heineken (bouteille)",
      description: "Bière Heineken en bouteille.",
      longDescription:
        "Bière Heineken en bouteille — la boisson parfaite avec votre repas burger. NB BURGER, restaurant de burgers à Ra'anana. 18+."
    }
  },
  "item-beer-goldstar": {
    en: {
      name: "Goldstar (Bottle)",
      description: "Goldstar beer in a bottle.",
      longDescription:
        "Goldstar beer in a bottle — a classic Israeli beer alongside your burger. NB BURGER, kosher burger restaurant in Ra'anana. 18+."
    },
    fr: {
      name: "Goldstar (bouteille)",
      description: "Bière Goldstar en bouteille.",
      longDescription:
        "Bière Goldstar en bouteille — une bière israélienne classique à côté du burger. NB BURGER, restaurant de burgers casher à Ra'anana. 18+."
    }
  }
};
