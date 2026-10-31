import type { Locale } from "@/i18n/config";

export const CAREERS_COPY = {
  he: {
    pageTitle: "דרושים עובדים ב־SO WHAT ברעננה | גם ללא ניסיון",
    description: "רוצים להצטרף לצוות SO WHAT ברעננה? אנחנו מחפשים עובדים גם ללא ניסיון. משאירים שם וטלפון בטופס קצר ואנחנו מכירים.",
    home: "דף הבית", breadcrumb: "דרושים", kicker: "SO WHAT · הצוות הבא שלנו",
    heading: "אנשים טובים.\nצוות שעושה טעם.",
    intro: "אוהבים אוכל, אנשים וקצב של מסעדה? בואו להכיר את הצוות של SO WHAT ברעננה. אנחנו מחפשים אנשים עם אנרגיה טובה, אחריות ורצון ללמוד.",
    note: "יש ניסיון? מעולה. אין ניסיון? נשמח להכיר גם אתכם.",
    badges: ["גם ללא ניסיון", "עבודה ברעננה", "בלי לצרף קורות חיים"],
    title: "דרושים עובדים", lead: "כמה פרטים קצרים, כדי שנוכל לחזור אליכם להיכרות.",
    fullName: "שם מלא", phone: "מספר טלפון", residenceArea: "אזור מגורים", age: "גיל",
    experience: "ניסיון קודם במסעדנות", yes: "יש ניסיון קודם", no: "אין ניסיון",
    required: "כל השדות נדרשים", submit: "שליחת מועמדות", sending: "שולחים…",
    privacy: "הפרטים ישמשו לטיפול בפנייה וליצירת קשר בנושא עבודה בלבד.", privacyLink: "מדיניות פרטיות",
    successTitle: "המועמדות התקבלה!", success: "תודה שרציתם להיות חלק מ־SO WHAT. הפרטים הגיעו לצוות, ונוכל לחזור אליכם בטלפון שהשארתם.",
    genericError: "לא הצלחנו לשלוח כרגע. הפרטים נשמרו בטופס — נסו שוב בעוד רגע.",
    fieldError: "בדקו שהפרטים בשדה זה מלאים ותקינים.", botLabel: "יש להשאיר שדה זה ריק"
  },
  en: {
    pageTitle: "Careers at SO WHAT Ra'anana | No experience needed",
    description: "Join the SO WHAT team in Ra'anana. We welcome applicants with or without experience. Apply using our short form.",
    home: "Home", breadcrumb: "Careers", kicker: "SO WHAT · JOIN THE TEAM",
    heading: "Good people.\nGreat things cooking.",
    intro: "Enjoy food, people and the pace of a restaurant? Meet the SO WHAT team in Ra'anana. We are looking for responsible people with good energy and a willingness to learn.",
    note: "Have experience? Great. New to restaurant work? We'd love to meet you too.",
    badges: ["No experience needed", "Work in Ra'anana", "No CV required"],
    title: "We're hiring", lead: "A few quick details so we can get in touch.",
    fullName: "Full name", phone: "Phone number", residenceArea: "Area of residence", age: "Age",
    experience: "Previous restaurant experience", yes: "I have experience", no: "No experience",
    required: "All fields are required", submit: "Send application", sending: "Sending…",
    privacy: "Your details will only be used to review your application and contact you about employment.", privacyLink: "Privacy policy",
    successTitle: "Application received!", success: "Thanks for your interest in SO WHAT. Your details have reached the team, who can contact you at the number provided.",
    genericError: "We couldn't send your application. Your details are still in the form. Please try again shortly.",
    fieldError: "Please check that this field is complete and valid.", botLabel: "Leave this field empty"
  },
  fr: {
    pageTitle: "Recrutement SO WHAT à Ra'anana | Débutants bienvenus",
    description: "Rejoignez l'équipe SO WHAT à Ra'anana, avec ou sans expérience. Postulez en quelques instants grâce à notre formulaire.",
    home: "Accueil", breadcrumb: "Recrutement", kicker: "SO WHAT · REJOIGNEZ L'ÉQUIPE",
    heading: "Une belle équipe.\nLe goût du travail ensemble.",
    intro: "Vous aimez la cuisine, le contact humain et le rythme d'un restaurant ? Chez SO WHAT à Ra'anana, nous recherchons des personnes responsables, enthousiastes et prêtes à apprendre.",
    note: "Vous avez de l'expérience ? Parfait. Vous débutez ? Nous aimerions aussi vous rencontrer.",
    badges: ["Débutants bienvenus", "À Ra'anana", "Sans CV"],
    title: "Nous recrutons", lead: "Quelques informations pour pouvoir vous recontacter.",
    fullName: "Nom complet", phone: "Téléphone", residenceArea: "Lieu de résidence", age: "Âge",
    experience: "Expérience en restauration", yes: "Avec expérience", no: "Sans expérience",
    required: "Tous les champs sont obligatoires", submit: "Envoyer ma candidature", sending: "Envoi…",
    privacy: "Vos coordonnées serviront uniquement à étudier votre candidature et à vous contacter au sujet d'un emploi.", privacyLink: "Confidentialité",
    successTitle: "Candidature reçue !", success: "Merci de votre intérêt pour SO WHAT. L'équipe a reçu vos coordonnées et pourra vous contacter au numéro indiqué.",
    genericError: "L'envoi a échoué. Vos informations restent dans le formulaire. Veuillez réessayer dans un instant.",
    fieldError: "Vérifiez que ce champ est complet et correct.", botLabel: "Laissez ce champ vide"
  }
} satisfies Record<Locale, object>;
