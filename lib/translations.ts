export type Language = "en" | "fr";

export interface Translations {
  common: {
    brandName: string;
    tagline: string;
    home: string;
    back: string;
    next: string;
    step: string;
    of: string;
    shoppingBag: string;
    fittingBag: string;
    garment: string;
    garments: string;
    close: string;
    cancel: string;
    save: string;
    confirm: string;
    verified: string;
    inStock: string;
    outOfStock: string;
    viewOnStore: string;
    ownedItem: string;
    notOwnedItem: string;
    addToBag: string;
    addedToBag: string;
    addAllToBag: string;
    cad: string;
    canadianBrands: string;
    loading: string;
    languageName: string;
    flag: string;
  };
  header: {
    title: string;
    fittingRoom: string;
    returnHome: string;
    stepWizard: string;
    singlePage: string;
    editProfile: string;
    startStyling: string;
    whyLoveIt: string;
    howItWorks: string;
    popularBrands: string;
    adminDashboard: string;
    about: string;
  };
  landing: {
    heroTitle: string;
    heroTitleHighlight: string;
    heroTitleEnd: string;
    cardSpecialTitle: string;
    cardEveryTitle: string;
    heroSubtitle: string;
    heroSubtitleHighlight: string;
    heroSubtitleEnd: string;
    tryFittingRoom: string;
    whyPeopleLoveIt: string;
    metric1Title: string;
    metric1Desc: string;
    metric2Title: string;
    metric2Desc: string;
    metric3Title: string;
    metric3Desc: string;
    pillarsBadge: string;
    pillarsTitle: string;
    pillarsDesc: string;
    pillar1Tag: string;
    pillar1Title: string;
    pillar1Desc: string;
    pillar1Bullet1: string;
    pillar1Bullet2: string;
    pillar2Tag: string;
    pillar2Title: string;
    pillar2Desc: string;
    pillar2Bullet1: string;
    pillar2Bullet2: string;
    pillar3Tag: string;
    pillar3Title: string;
    pillar3Desc: string;
    pillar3Bullet1: string;
    pillar3Bullet2: string;
    howBadge: string;
    howTitle: string;
    howDesc: string;
    step1Num: string;
    step1Title: string;
    step1Desc: string;
    step2Num: string;
    step2Title: string;
    step2Desc: string;
    step3Num: string;
    step3Title: string;
    step3Desc: string;
    brandsTitle: string;
    ctaTitle: string;
    ctaDesc: string;
    ctaButton: string;
    footerRights: string;
    footerPrivacy: string;
    footerWeather: string;
  };
  profile: {
    step0Badge: string;
    step0Title: string;
    step0Subtitle: string;
    goalOccasionTitle: string;
    goalOccasionDesc: string;
    goalEverydayTitle: string;
    goalEverydayDesc: string;
    genderTitle: string;
    genderWomen: string;
    genderWomenDesc: string;
    genderMen: string;
    genderMenDesc: string;
    genderUnisex: string;
    genderUnisexDesc: string;
    step1Badge: string;
    step1Title: string;
    step1Subtitle: string;
    occPitch: string;
    occPitchDesc: string;
    occInterview: string;
    occInterviewDesc: string;
    occWork: string;
    occWorkDesc: string;
    occDate: string;
    occDateDesc: string;
    occWedding: string;
    occWeddingDesc: string;
    occTravel: string;
    occTravelDesc: string;
    occCasual: string;
    occCasualDesc: string;
    audienceContextTitle: string;
    audiencePlaceholder: string;
    step2Badge: string;
    step2Title: string;
    step2Subtitle: string;
    styleClassic: string;
    styleClassicDesc: string;
    styleSmartCasual: string;
    styleSmartCasualDesc: string;
    styleRelaxed: string;
    styleRelaxedDesc: string;
    styleBold: string;
    styleBoldDesc: string;
    lifestyleTitle: string;
    lifeCommuter: string;
    lifeHybrid: string;
    lifeOutdoors: string;
    lifeSocial: string;
    lifeTraveler: string;
    step3Badge: string;
    step3Title: string;
    step3Subtitle: string;
    bodyRectangle: string;
    bodyRectangleDesc: string;
    bodyInverted: string;
    bodyInvertedDesc: string;
    bodyPear: string;
    bodyPearDesc: string;
    bodyHourglass: string;
    bodyHourglassDesc: string;
    bodyRound: string;
    bodyRoundDesc: string;
    bodyNotSure: string;
    step4Badge: string;
    step4Title: string;
    step4Subtitle: string;
    complexionTitle: string;
    compLight: string;
    compMedium: string;
    compDark: string;
    paletteSummer: string;
    paletteSummerDesc: string;
    paletteAutumn: string;
    paletteAutumnDesc: string;
    paletteWinter: string;
    paletteWinterDesc: string;
    paletteSpring: string;
    paletteSpringDesc: string;
    paletteNotSure: string;
    step5Badge: string;
    step5Title: string;
    step5Subtitle: string;
    seasonTitle: string;
    seasonWinter: string;
    seasonFall: string;
    seasonSpring: string;
    seasonSummer: string;
    seasonAll: string;
    sizeTitle: string;
    budgetTitle: string;
    budget1: string;
    budget2: string;
    budget3: string;
    seeOutfitsBtn: string;
    nextBtn: string;
    prevBtn: string;
    stepIndicator: string;
  };
  occasionResult: {
    backToProfile: string;
    calibrationFormality: string;
    recalibrating: string;
    stylistRationale: string;
    whyWorks: string;
    slotOuterwear: string;
    slotTop: string;
    slotBottom: string;
    slotShoes: string;
    slotAccessory: string;
    alreadyOwn: string;
    inCloset: string;
    buyDirect: string;
    nudgeTitle: string;
    nudgeSubtitle: string;
    nudgeTooFormal: string;
    nudgeTooCasual: string;
    nudgeNotMe: string;
    subtotalLabel: string;
    addAllBtn: string;
    cadPrice: string;
    fabricNote: string;
  };
  capsuleResult: {
    title: string;
    subtitle: string;
    filterAll: string;
    filterTops: string;
    filterBottoms: string;
    filterOuterwear: string;
    filterShoes: string;
    filterAccessories: string;
    looksTitle: string;
    looksSubtitle: string;
    look1: string;
    look1Desc: string;
    look2: string;
    look2Desc: string;
    look3: string;
    look3Desc: string;
    replanBtn: string;
    replanning: string;
    starterSetTitle: string;
    starterSetDesc: string;
    addStarterBtn: string;
    addAllCapsuleBtn: string;
    itemsCount: string;
  };
  cart: {
    title: string;
    itemsCount: string;
    emptyCart: string;
    emptyDesc: string;
    clearCart: string;
    estimatedTotal: string;
    checkoutBtn: string;
    taxesNote: string;
    removeItem: string;
  };
  checkout: {
    title: string;
    subtitle: string;
    orderSummary: string;
    emailLabel: string;
    emailPlaceholder: string;
    surveyTitle: string;
    surveyHint: string;
    surveyFree: string;
    surveyPerOrder: string;
    surveyMonthly: string;
    surveyVip: string;
    submitBtn: string;
    submitting: string;
    successTitle: string;
    successDesc: string;
    returnBtn: string;
  };
  loading: {
    step1: string;
    step2Occasion: string;
    step2Capsule: string;
    subtitle: string;
    loadingProfile: string;
  };
}

export const translations: Record<Language, Translations> = {
  en: {
    common: {
      brandName: "Style Advisor",
      tagline: "The Fitting Room",
      home: "Home",
      back: "Back",
      next: "Next",
      step: "Step",
      of: "of",
      shoppingBag: "Shopping Bag",
      fittingBag: "Fitting Bag",
      garment: "garment",
      garments: "garments",
      close: "Close",
      cancel: "Cancel",
      save: "Save",
      confirm: "Confirm",
      verified: "Verified Canadian Store",
      inStock: "In Stock",
      outOfStock: "Sold Out",
      viewOnStore: "Buy at",
      ownedItem: "Already in my closet",
      notOwnedItem: "Need this piece",
      addToBag: "Add to Bag",
      addedToBag: "In Bag",
      addAllToBag: "Add All to Bag",
      cad: "CAD",
      canadianBrands: "Canadian Brands",
      loading: "Loading...",
      languageName: "English (Canada)",
      flag: "🇨🇦",
    },
    header: {
      title: "Style Advisor",
      fittingRoom: "Personal Fitting Room",
      returnHome: "← Home",
      stepWizard: "Step Wizard",
      singlePage: "Single Page",
      editProfile: "← Edit Profile",
      startStyling: "Start Styling →",
      whyLoveIt: "Why You'll Love It",
      howItWorks: "How It Works",
      popularBrands: "Popular Brands",
      adminDashboard: "Admin",
      about: "About",
    },
    landing: {
      heroTitle: "Look great and feel confident,",
      heroTitleHighlight: "for every occasion",
      heroTitleEnd: "",
      cardSpecialTitle: "Special",
      cardEveryTitle: "Every",
      heroSubtitle: "Your personal style advisor tailored to your body shape, best colors, and Canadian weather—recommending only",
      heroSubtitleHighlight: "100% real, in-stock clothes",
      heroSubtitleEnd: "from trusted Canadian brands.",
      tryFittingRoom: "✨ Try the Fitting Room →",
      whyPeopleLoveIt: "Why People Love It",
      metric1Title: "Zero Guesswork",
      metric1Desc: "Full Outfit Curation",
      metric2Title: "100%",
      metric2Desc: "Real Canadian Stores",
      metric3Title: "-$1,200",
      metric3Desc: "Stop Wasting Money",
      pillarsBadge: "3 Simple Promises",
      pillarsTitle: "Getting Dressed Just Got Effortless",
      pillarsDesc: "We solved the three biggest headaches of shopping online and figuring out what to wear.",
      pillar1Tag: "Save Time",
      pillar1Title: "Dressed in a Few Clicks",
      pillar1Desc: "No more standing in front of your closet feeling stuck, or spending hours bouncing between 10 browser tabs. Get a full head-to-toe look ready for you.",
      pillar1Bullet1: "Say goodbye to morning stress",
      pillar1Bullet2: "Complete head-to-toe curation",
      pillar2Tag: "Save Money",
      pillar2Title: "No More Regret Buys",
      pillar2Desc: "Stop buying items that look nice online but end up hanging unworn in your closet. Our mix-and-match capsule makes sure every piece goes with everything else.",
      pillar2Bullet1: "Save up to $1,200/year on unworn clothes",
      pillar2Bullet2: "Clothes that you'll actually wear",
      pillar3Tag: "100% Real",
      pillar3Title: "Real Clothes You Can Buy",
      pillar3Desc: "Other AI tools generate fake images of clothes that don't exist. Style Advisor only suggests real garments that are currently in stock with direct links to buy.",
      pillar3Bullet1: "Direct links to official brand stores",
      pillar3Bullet2: "Clear CAD prices with stock availability",
      howBadge: "How It Works",
      howTitle: "3 Easy Steps to Great Style",
      howDesc: "Designed to make getting dressed easy, fun, and foolproof.",
      step1Num: "01",
      step1Title: "Tell Us About You",
      step1Desc: "Share your body shape, your favourite colors, and your overall style vibe so we know what fits you best.",
      step2Num: "02",
      step2Title: "Where Are You Heading?",
      step2Desc: "Whether it's an interview, a date, or just upgrading your weekly office wardrobe, pick the setting you're dressing for.",
      step3Num: "03",
      step3Title: "Get Your Complete Look",
      step3Desc: "Receive head-to-toe outfit recommendations with friendly stylist tips on why each piece works for you.",
      brandsTitle: "Featuring Clothes From Top Canadian Brands",
      ctaTitle: "Ready to Love What You Wear?",
      ctaDesc: "Hop into the Fitting Room. Your personalized outfit suggestions are only a few clicks away.",
      ctaButton: "Start Styling Now →",
      footerRights: "© 2026 Style Advisor · ProductBC Build-a-Thon Demo",
      footerPrivacy: "Privacy Friendly",
      footerWeather: "Weather & Climate Ready",
    },
    profile: {
      step0Badge: "Step 01",
      step0Title: "Styling Goal & Fashion Line",
      step0Subtitle: "Choose what you're dressing for and which clothing department fits you best.",
      goalOccasionTitle: "High-Stakes Occasion",
      goalOccasionDesc: "A complete head-to-toe look for an interview, presentation, wedding, or date night",
      goalEverydayTitle: "Everyday Capsule Wardrobe",
      goalEverydayDesc: "A 15-piece mix-and-match capsule that gives you weeks of effortless outfits",
      genderTitle: "Fashion Line",
      genderWomen: "Womenswear",
      genderWomenDesc: "Tailored blazers, fluid trousers, dresses, and feminine silhouettes",
      genderMen: "Menswear",
      genderMenDesc: "Structured blazers, classic shirts, chinos, and masculine cuts",
      genderUnisex: "Unisex / Gender-Neutral",
      genderUnisexDesc: "Relaxed minimalist staples, clean overshirts, and versatile cuts",
      step1Badge: "Step 02",
      step1Title: "Where Are You Heading?",
      step1Subtitle: "Pick the event or setting so we can calibrate how formal and practical you need to be.",
      occPitch: "Pitch / Presentation",
      occPitchDesc: "Look credible and innovative without looking stiff",
      occInterview: "Job Interview",
      occInterviewDesc: "Confident, polished, and put-together",
      occWork: "Office / Work",
      occWorkDesc: "Smart, dependable business-casual",
      occDate: "Date Night",
      occDateDesc: "Charming, comfortable, and thoughtful",
      occWedding: "Wedding / Gala",
      occWeddingDesc: "Refined, celebratory, and occasion-ready",
      occTravel: "Travel / Weekend",
      occTravelDesc: "Wrinkle-resistant, layered, and easy",
      occCasual: "Casual / Daily",
      occCasualDesc: "Relaxed comfort with an elevated touch",
      audienceContextTitle: "Tell us a bit more about the crowd or venue (optional):",
      audiencePlaceholder: "e.g., Tech partners in Gastown, coffee chat with a mentor, chilly rooftop dinner...",
      step2Badge: "Step 03",
      step2Title: "Your Style & Lifestyle",
      step2Subtitle: "How would you describe your everyday aesthetic?",
      styleClassic: "Classic & Timeless",
      styleClassicDesc: "Crisp lines, neutral tones, quality tailoring",
      styleSmartCasual: "Smart Casual",
      styleSmartCasualDesc: "Chinos, sweaters, polished layering",
      styleRelaxed: "Relaxed & Modern",
      styleRelaxedDesc: "Comfort-first, oversized knits, easy sneakers",
      styleBold: "Bold & Creative",
      styleBoldDesc: "Textured fabrics, statement layers, distinctive tones",
      lifestyleTitle: "Your Daily Routine (pick up to 2):",
      lifeCommuter: "Urban Commuter",
      lifeHybrid: "Remote / Hybrid",
      lifeOutdoors: "Active / Outdoors",
      lifeSocial: "Dining & Events",
      lifeTraveler: "Frequent Traveler",
      step3Badge: "Step 04",
      step3Title: "Body Shape & Proportions",
      step3Subtitle: "We pick clothes that naturally flatter your proportions and fit comfortably.",
      bodyRectangle: "Rectangle / Athletic",
      bodyRectangleDesc: "Shoulders, waist, and hips are fairly aligned",
      bodyInverted: "Inverted Triangle",
      bodyInvertedDesc: "Broader shoulders with narrower waist and hips",
      bodyPear: "Triangle / Pear",
      bodyPearDesc: "Hips are slightly wider than the shoulders",
      bodyHourglass: "Hourglass",
      bodyHourglassDesc: "Balanced shoulders and hips with a defined waist",
      bodyRound: "Round / Oval",
      bodyRoundDesc: "Fuller midsection with softer curves",
      bodyNotSure: "Not sure? Let us pick universally flattering cuts",
      step4Badge: "Step 05",
      step4Title: "Color Palette & Complexion",
      step4Subtitle: "Find the shades that make your skin and eyes glow.",
      complexionTitle: "Your Skin Complexion:",
      compLight: "Fair / Light",
      compMedium: "Medium / Olive",
      compDark: "Tan / Deep",
      paletteSummer: "Cool Summer",
      paletteSummerDesc: "Soft blues, lavender, slate grey, sage",
      paletteAutumn: "Warm Autumn",
      paletteAutumnDesc: "Camel, olive, rust, deep espresso",
      paletteWinter: "Clear Winter",
      paletteWinterDesc: "True navy, crisp black, emerald, ice blue",
      paletteSpring: "Fresh Spring",
      paletteSpringDesc: "Warm beige, terracotta, peach, moss green",
      paletteNotSure: "Not sure? We'll use universally pleasing neutrals",
      step5Badge: "Step 06",
      step5Title: "Weather, Sizing & Budget",
      step5Subtitle: "The practical details to ensure your recommendations are wearable right now.",
      seasonTitle: "Current Season / Climate:",
      seasonWinter: "Winter (Sub-zero, warm coats & thermal layers)",
      seasonFall: "Fall (Crisp air, cozy knits & light jackets)",
      seasonSpring: "Spring (Showers, layered cardigans & trench)",
      seasonSummer: "Summer (Warm & breathable linens/cottons)",
      seasonAll: "All-Season (Versatile indoor staples)",
      sizeTitle: "Standard Clothing Size:",
      budgetTitle: "Comfortable Price Range:",
      budget1: "Accessible / Smart Value (under $100/piece)",
      budget2: "Mid-Range / Contemporary ($100 - $250/piece)",
      budget3: "Premium / Investment ($250+/piece)",
      seeOutfitsBtn: "See My Outfits →",
      nextBtn: "Next Step →",
      prevBtn: "← Back",
      stepIndicator: "Step",
    },
    occasionResult: {
      backToProfile: "← Back to Fitting Profile",
      calibrationFormality: "Formality Calibration:",
      recalibrating: "Re-calibrating outfit formality & tone per your feedback...",
      stylistRationale: "Stylist Rationale & Context",
      whyWorks: "Why this outfit works for your setting:",
      slotOuterwear: "Layer / Outerwear",
      slotTop: "Foundation Top",
      slotBottom: "Tailored Bottom",
      slotShoes: "Footwear",
      slotAccessory: "Accent / Accessory",
      alreadyOwn: "I already own this piece",
      inCloset: "In your closet",
      buyDirect: "Buy at",
      nudgeTitle: "Need an adjustment?",
      nudgeSubtitle: "Help our stylist fine-tune the look to your exact comfort zone.",
      nudgeTooFormal: "A bit too formal — keep it more relaxed",
      nudgeTooCasual: "A bit too casual — elevate the polish",
      nudgeNotMe: "Not quite my style — try different pieces",
      subtotalLabel: "Outfit Estimated Total:",
      addAllBtn: "Add All Available to Bag",
      cadPrice: "CAD",
      fabricNote: "Fabric & Care",
    },
    capsuleResult: {
      title: "Your 15-Piece Capsule Wardrobe",
      subtitle: "Mix and match these pieces to create over 30 effortless looks.",
      filterAll: "All Pieces (15)",
      filterTops: "Tops (5)",
      filterBottoms: "Bottoms (4)",
      filterOuterwear: "Layers (3)",
      filterShoes: "Shoes (2)",
      filterAccessories: "Accents (1)",
      looksTitle: "3 Worked Outfits From This Capsule",
      looksSubtitle: "Here is how to combine these pieces for different everyday moments:",
      look1: "Look 1: Polished Professional",
      look1Desc: "Tailored for the office, key client meetings, or smart lunches.",
      look2: "Look 2: Smart Casual",
      look2Desc: "Relaxed yet intentional for hybrid days, coffee catch-ups, or evening dinners.",
      look3: "Look 3: Weekend Easy",
      look3Desc: "Comfort-first, casual and ready for exploring the city.",
      replanBtn: "Re-generate Capsule",
      replanning: "Building new capsule...",
      starterSetTitle: "5-Piece Starter Pack",
      starterSetDesc: "The highest-versatility foundation to get you started immediately.",
      addStarterBtn: "Add Starter 5 to Bag",
      addAllCapsuleBtn: "Add All 15 to Bag",
      itemsCount: "items",
    },
    cart: {
      title: "Fitting Bag (Shared Cart)",
      itemsCount: "garments verified",
      emptyCart: "Your fitting bag is empty",
      emptyDesc: "Add pieces from your outfit recommendation to preview links and prices.",
      clearCart: "Clear Bag",
      estimatedTotal: "Estimated Total (CAD):",
      checkoutBtn: "Proceed to Checkout & Links →",
      taxesNote: "Taxes and shipping calculated on retailer websites.",
      removeItem: "Remove",
    },
    checkout: {
      title: "Reserve Your Look & Direct Links",
      subtitle: "We'll send you verified direct retailer links and personalized fit notes.",
      orderSummary: "Selected Garments Summary",
      emailLabel: "Your Email Address:",
      emailPlaceholder: "you@example.ca",
      surveyTitle: "How much would you pay for personal AI styling like this?",
      surveyHint: "Slide to share your honest thought — this helps us keep improving!",
      surveyFree: "$0 CAD (Free online links only)",
      surveyPerOrder: "$20 CAD / order (Occasional high-stakes event styling)",
      surveyMonthly: "$35 CAD / month (Quarterly seasonal wardrobe concierge)",
      surveyVip: "$50 CAD / month (VIP On-demand styling & tailoring)",
      submitBtn: "Send Me the Direct Links",
      submitting: "Preparing your links...",
      successTitle: "You're All Set!",
      successDesc: "We've saved your selection. You can now shop directly at the verified retailers below:",
      returnBtn: "Return to Fitting Room",
    },
    loading: {
      step1: "Checking in-stock Canadian clothes...",
      step2Occasion: "Putting your outfit together...",
      step2Capsule: "Building your capsule wardrobe...",
      subtitle: "Finding the best matches for your shape, colors, and setting",
      loadingProfile: "Loading Fitting Room profile...",
    },
  },
  fr: {
    common: {
      brandName: "Style Advisor",
      tagline: "La Cabine d'essayage",
      home: "Accueil",
      back: "Retour",
      next: "Suivant",
      step: "Étape",
      of: "sur",
      shoppingBag: "Panier d'achats",
      fittingBag: "Panier d'essayage",
      garment: "vêtement",
      garments: "vêtements",
      close: "Fermer",
      cancel: "Annuler",
      save: "Enregistrer",
      confirm: "Confirmer",
      verified: "Boutique canadienne vérifiée",
      inStock: "En stock",
      outOfStock: "Épuisé",
      viewOnStore: "Acheter chez",
      ownedItem: "Déjà dans ma garde-robe",
      notOwnedItem: "Pièce à ajouter",
      addToBag: "Ajouter au panier",
      addedToBag: "Dans le panier",
      addAllToBag: "Tout ajouter au panier",
      cad: "CAD",
      canadianBrands: "Marques canadiennes",
      loading: "Chargement...",
      languageName: "Français",
      flag: "⚜️",
    },
    header: {
      title: "Style Advisor",
      fittingRoom: "Cabine d'essayage personnalisée",
      returnHome: "← Accueil",
      stepWizard: "Par étapes",
      singlePage: "Page unique",
      editProfile: "← Modifier le profil",
      startStyling: "Trouver mon style →",
      whyLoveIt: "Pourquoi vous allez l'adorer",
      howItWorks: "Comment ça marche",
      popularBrands: "Marques populaires",
      adminDashboard: "Admin",
      about: "À propos",
    },
    landing: {
      heroTitle: "Ayez fière allure et sentez-vous bien,",
      heroTitleHighlight: "en toute occasion",
      heroTitleEnd: "",
      cardSpecialTitle: "Spécial",
      cardEveryTitle: "Quotidien",
      heroSubtitle: "Votre conseiller de style personnel adapté à votre morphologie, vos couleurs idéales et la météo canadienne — avec uniquement des",
      heroSubtitleHighlight: "vêtements 100% réels et en stock",
      heroSubtitleEnd: "chez des marques canadiennes de confiance.",
      tryFittingRoom: "✨ Entrer dans la cabine d'essayage →",
      whyPeopleLoveIt: "Pourquoi nos utilisateurs l'adorent",
      metric1Title: "Zéro hésitation",
      metric1Desc: "Tenues complètes de la tête aux pieds",
      metric2Title: "100%",
      metric2Desc: "Vraies boutiques canadiennes",
      metric3Title: "-1 200 $",
      metric3Desc: "Économies annuelles en vêtements",
      pillarsBadge: "3 promesses toutes simples",
      pillarsTitle: "S'habiller devient un jeu d'enfant",
      pillarsDesc: "Nous avons réglé les trois plus grands tracas des achats en ligne et du choix vestimentaire le matin.",
      pillar1Tag: "Gagnez du temps",
      pillar1Title: "Habillé en quelques clics",
      pillar1Desc: "Fini de rester planté devant votre garde-robe sans savoir quoi mettre, ou de passer des heures entre 10 onglets de boutiques. Obtenez un ensemble complet pensé pour vous.",
      pillar1Bullet1: "Dites adieu au stress du matin",
      pillar1Bullet2: "Coordination complète de la tête aux pieds",
      pillar2Tag: "Économisez de l'argent",
      pillar2Title: "Fini les achats regrettés",
      pillar2Desc: "Cessez d'acheter des morceaux jolis en photo mais jamais portés. Notre capsule modulable s'assure que chaque pièce se marie parfaitement avec les autres.",
      pillar2Bullet1: "Économisez jusqu'à 1 200 $/an en vêtements jamais portés",
      pillar2Bullet2: "Des vêtements que vous porterez vraiment",
      pillar3Tag: "100% Réel",
      pillar3Title: "De vrais vêtements que vous pouvez acheter",
      pillar3Desc: "Les autres outils d'IA inventent des vêtements qui n'existent pas. Style Advisor vous propose uniquement de vrais vêtements actuellement en stock avec liens directs.",
      pillar3Bullet1: "Liens directs vers les boutiques officielles",
      pillar3Bullet2: "Prix clairs en dollars canadiens (CAD) et stock vérifié",
      howBadge: "Comment ça marche",
      howTitle: "3 étapes simples vers votre style",
      howDesc: "Pensé pour rendre le choix de vos vêtements simple, agréable et sans fausse note.",
      step1Num: "01",
      step1Title: "Parlez-nous de vous",
      step1Desc: "Indiquez votre silhouette, vos couleurs préférées et votre style de tous les jours pour des suggestions qui vous vont bien.",
      step2Num: "02",
      step2Title: "Où allez-vous ?",
      step2Desc: "Qu'il s'agisse d'une entrevue d'embauche, d'une soirée ou de votre garde-robe de bureau, choisissez le bon moment.",
      step3Num: "03",
      step3Title: "Recevez votre tenue complète",
      step3Desc: "Obtenez des ensembles assortis avec des explications bienveillantes pour comprendre pourquoi chaque morceau vous va.",
      brandsTitle: "Des vêtements des meilleures marques canadiennes",
      ctaTitle: "Prêt(e) à aimer ce que vous portez ?",
      ctaDesc: "Entrez dans la cabine d'essayage. Vos recommandations personnalisées sont à portée de clic.",
      ctaButton: "Trouver mon style maintenant →",
      footerRights: "© 2026 Style Advisor · Démo ProductBC Build-a-Thon",
      footerPrivacy: "Respect de la vie privée",
      footerWeather: "Adapté au climat et aux saisons",
    },
    profile: {
      step0Badge: "Étape 01",
      step0Title: "Objectif & Ligne de mode",
      step0Subtitle: "Choisissez ce pour quoi vous vous habillez et la ligne qui correspond à vos préférences.",
      goalOccasionTitle: "Occasion spéciale",
      goalOccasionDesc: "Une tenue complète et soignée pour une entrevue, une présentation, un mariage ou un rendez-vous",
      goalEverydayTitle: "Garde-robe capsule du quotidien",
      goalEverydayDesc: "Une sélection modulable de 15 pièces pour créer facilement des semaines de tenues harmonieuses",
      genderTitle: "Ligne de mode",
      genderWomen: "Mode féminine",
      genderWomenDesc: "Vestons ajustés, pantalons fluides, robes et silhouettes féminines",
      genderMen: "Mode masculine",
      genderMenDesc: "Vestons structurés, chemises classiques, chinos et coupes masculines",
      genderUnisex: "Unisexe / Non-genré",
      genderUnisexDesc: "Essentiels minimalistes, surchemises épurées et coupes universelles",
      step1Badge: "Étape 02",
      step1Title: "Quelle est l'occasion ?",
      step1Subtitle: "Indiquez le contexte pour nous permettre d'ajuster le niveau de tenue et de confort.",
      occPitch: "Présentation / Pitch",
      occPitchDesc: "Crédible et dynamique, sans être guindé",
      occInterview: "Entrevue d'embauche",
      occInterviewDesc: "Soigné, confiant et rassurant",
      occWork: "Bureau / Travail",
      occWorkDesc: "Chic décontracté, professionnel et confortable",
      occDate: "Soirée / Rendez-vous",
      occDateDesc: "Chaleureux, élégant et détendu",
      occWedding: "Mariage / Cérémonie",
      occWeddingDesc: "Raffiné, festif et digne de l'occasion",
      occTravel: "Voyage / Fin de semaine",
      occTravelDesc: "Pratique, superposable et tout confort",
      occCasual: "Quotidien / Détente",
      occCasualDesc: "Confortable au quotidien avec une touche soignée",
      audienceContextTitle: "Dites-nous un peu plus sur l'endroit ou les personnes (facultatif) :",
      audiencePlaceholder: "ex. Rencontre d'équipe informelle, café avec un mentor, souper au restaurant...",
      step2Badge: "Étape 03",
      step2Title: "Votre style & votre rythme",
      step2Subtitle: "Comment décririez-vous vos goûts au quotidien ?",
      styleClassic: "Classique & Intemporel",
      styleClassicDesc: "Lignes nettes, tons neutres, belles matières",
      styleSmartCasual: "Chic décontracté",
      styleSmartCasualDesc: "Chinos, tricots doux, superpositions soignées",
      styleRelaxed: "Moderne & Décontracté",
      styleRelaxedDesc: "Priorité au confort, coupes souples, baskets urbaines",
      styleBold: "Audacieux & Créatif",
      styleBoldDesc: "Matières texturées, coupes affirmées, touches de couleur",
      lifestyleTitle: "Votre quotidien (choisissez jusqu'à 2) :",
      lifeCommuter: "Transports urbains",
      lifeHybrid: "Télétravail / Hybride",
      lifeOutdoors: "Actif / Plein air",
      lifeSocial: "Sorties & Restaurants",
      lifeTraveler: "Déplacements fréquents",
      step3Badge: "Étape 04",
      step3Title: "Morphologie & Silhouette",
      step3Subtitle: "Nous sélectionnons des coupes qui épousent naturellement votre silhouette et vous mettent à l'aise.",
      bodyRectangle: "Rectangle / Athlétique",
      bodyRectangleDesc: "Épaules, taille et hanches d'une largeur similaire",
      bodyInverted: "Triangle inversé",
      bodyInvertedDesc: "Épaules plus larges que les hanches",
      bodyPear: "Triangle / Poire",
      bodyPearDesc: "Hanches légèrement plus larges que les épaules",
      bodyHourglass: "Sablier",
      bodyHourglassDesc: "Épaules et hanches équilibrées avec taille marquée",
      bodyRound: "Ovale / Ronde",
      bodyRoundDesc: "Courbes douces et silhouette harmonieuse",
      bodyNotSure: "Pas certain(e) ? Laissez-nous choisir les coupes les plus universelles",
      step4Badge: "Étape 05",
      step4Title: "Palette de couleurs & Teint",
      step4Subtitle: "Découvrez les tons qui illuminent votre visage et mettent en valeur vos yeux.",
      complexionTitle: "Votre carnation :",
      compLight: "Claire / Lumineuse",
      compMedium: "Moyenne / Hâlée",
      compDark: "Foncée / Profonde",
      paletteSummer: "Été doux",
      paletteSummerDesc: "Bleus doux, lavande, gris ardoise, sauge",
      paletteAutumn: "Automne chaleureux",
      paletteAutumnDesc: "Camel, olive, rouille, espresso profond",
      paletteWinter: "Hiver éclatant",
      paletteWinterDesc: "Bleu marine profond, noir pur, émeraude, blanc éclatant",
      paletteSpring: "Printemps frais",
      paletteSpringDesc: "Beige doré, terre cuite, pêche, vert mousse",
      paletteNotSure: "Pas certain(e) ? Nous utiliserons des tons neutres universels",
      step5Badge: "Étape 06",
      step5Title: "Météo, Taille & Budget",
      step5Subtitle: "Les détails pratiques pour que vos tenues soient prêtes à être portées dès aujourd'hui.",
      seasonTitle: "Saison / Climat actuel :",
      seasonWinter: "Hiver (Froid rigoureux, manteaux chauds & tricots)",
      seasonFall: "Automne (Temps frais, mailles douces & vestes légères)",
      seasonSpring: "Printemps (Averses douces, trench & cardigans)",
      seasonSummer: "Été (Chaleur, lin léger & cotons respirants)",
      seasonAll: "Toute l'année (Essentiels intemporels polyvalents)",
      sizeTitle: "Votre taille habituelle :",
      budgetTitle: "Fourchette de prix souhaitée :",
      budget1: "Accessible / Bon rapport qualité-prix (moins de 100 $/pièce)",
      budget2: "Gamme moyenne / Contemporain (100 $ - 250 $/pièce)",
      budget3: "Haut de gamme / Investissement (250 $+/pièce)",
      seeOutfitsBtn: "Voir mes recommandations →",
      nextBtn: "Étape suivante →",
      prevBtn: "← Retour",
      stepIndicator: "Étape",
    },
    occasionResult: {
      backToProfile: "← Retour au profil d'essayage",
      calibrationFormality: "Niveau de tenue :",
      recalibrating: "Ajustement de la tenue selon vos préférences...",
      stylistRationale: "Conseil de notre styliste",
      whyWorks: "Pourquoi cette tenue fonctionne pour votre occasion :",
      slotOuterwear: "Veste / Manteau",
      slotTop: "Haut / Chemise",
      slotBottom: "Pantalon / Bas",
      slotShoes: "Chaussures",
      slotAccessory: "Accessoire",
      alreadyOwn: "J'ai déjà cette pièce chez moi",
      inCloset: "Déjà dans votre garde-robe",
      buyDirect: "Acheter chez",
      nudgeTitle: "Envie d'un ajustement ?",
      nudgeSubtitle: "Dites à notre styliste ce que vous préférez pour peaufiner l'ensemble.",
      nudgeTooFormal: "Un peu trop habillé — plus décontracté",
      nudgeTooCasual: "Un peu trop simple — rehausser l'élégance",
      nudgeNotMe: "Pas tout à fait mon style — essayer d'autres pièces",
      subtotalLabel: "Total estimé de la tenue :",
      addAllBtn: "Tout ajouter au panier d'essayage",
      cadPrice: "CAD",
      fabricNote: "Matière & Entretien",
    },
    capsuleResult: {
      title: "Votre garde-robe capsule de 15 pièces",
      subtitle: "Combinez ces pièces faciles à agencer pour créer plus de 30 looks sans hésiter.",
      filterAll: "Toutes les pièces (15)",
      filterTops: "Hauts (5)",
      filterBottoms: "Bas (4)",
      filterOuterwear: "Vestes (3)",
      filterShoes: "Chaussures (2)",
      filterAccessories: "Accessoires (1)",
      looksTitle: "3 tenues complètes issues de cette capsule",
      looksSubtitle: "Voici comment coordonner ces pièces pour vos moments du quotidien :",
      look1: "Look 1 : Professionnel élégant",
      look1Desc: "Parfait pour le bureau, les rencontres importantes ou les dîners d'affaires.",
      look2: "Look 2 : Chic décontracté",
      look2Desc: "Idéal pour les journées hybrides, un café entre collègues ou une sortie en soirée.",
      look3: "Look 3 : Fin de semaine détendue",
      look3Desc: "Confortable, facile à vivre et soigné pour vos moments de détente en ville.",
      replanBtn: "Re-générer la capsule",
      replanning: "Création d'une nouvelle capsule...",
      starterSetTitle: "Trousse de départ de 5 pièces",
      starterSetDesc: "Les 5 pièces clés les plus faciles à agencer pour démarrer sans attendre.",
      addStarterBtn: "Ajouter les 5 pièces clés au panier",
      addAllCapsuleBtn: "Ajouter les 15 pièces au panier",
      itemsCount: "pièces",
    },
    cart: {
      title: "Panier d'essayage",
      itemsCount: "vêtements vérifiés",
      emptyCart: "Votre panier d'essayage est vide",
      emptyDesc: "Ajoutez des vêtements depuis votre sélection pour consulter les liens d'achat et les prix.",
      clearCart: "Vider le panier",
      estimatedTotal: "Total estimé (CAD) :",
      checkoutBtn: "Accéder aux boutiques et liens →",
      taxesNote: "Taxes et frais de livraison calculés sur les boutiques en ligne.",
      removeItem: "Retirer",
    },
    checkout: {
      title: "Recevez votre sélection et les liens directs",
      subtitle: "Nous vous envoyons les liens vérifiés vers les boutiques officielles et vos conseils de coupe.",
      orderSummary: "Résumé des vêtements choisis",
      emailLabel: "Votre adresse courriel :",
      emailPlaceholder: "vous@exemple.ca",
      surveyTitle: "Combien seriez-vous prêt(e) à payer pour un service de stylisme personnalisé ?",
      surveyHint: "Faites glisser le curseur pour nous donner votre avis franc — cela nous aide énormément !",
      surveyFree: "0 $ CAD (Liens gratuits en ligne seulement)",
      surveyPerOrder: "20 $ CAD / commande (Stylisme ponctuel pour un événement)",
      surveyMonthly: "35 $ CAD / mois (Garde-robe saisonnière renouvelée chaque trimestre)",
      surveyVip: "50 $ CAD / mois (Service VIP avec conseils personnalisés à la demande)",
      submitBtn: "M'envoyer les liens directs",
      submitting: "Préparation de vos liens...",
      successTitle: "C'est tout prêt !",
      successDesc: "Nous avons bien enregistré votre sélection. Vous pouvez magasiner directement auprès des boutiques vérifiées ci-dessous :",
      returnBtn: "Retourner à la cabine d'essayage",
    },
    loading: {
      step1: "Vérification des vêtements en stock au Canada...",
      step2Occasion: "Composition de votre tenue sur mesure...",
      step2Capsule: "Création de votre garde-robe capsule...",
      subtitle: "Recherche des meilleures pièces adaptées à votre silhouette et à la météo",
      loadingProfile: "Chargement de votre cabine d'essayage...",
    },
  },
};
