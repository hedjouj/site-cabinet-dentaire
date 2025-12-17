// **Mocked** content source for the dental practice website.
// The app loads/saves editable sections to localStorage so future backend wiring is straightforward.

const STORAGE_KEY = "dgendre_site_content_v1";
const MSG_KEY = "dgendre_contact_messages_v1";

export const DEFAULT_CONTENT = {
  practice: {
    name: "Docteur Charlotte Gendre",
    specialty: "Chirurgien-Dentiste",
    citySeo: "Seysses",
    address: "680 Route de Toulouse, 31600 Seysses, France",
    phoneDisplay: "05 62 20 47 53",
    phoneE164: "+33562204753",
  },
  hero: {
    title: "Des soins dentaires modernes, avec une attention sincère à votre confort",
    subtitle:
      "Bienvenue au cabinet du Docteur Charlotte Gendre à Seysses. Une prise en charge claire, des explications simples, et une approche centrée sur la prévention.",
    primaryCta: "Prendre rendez-vous",
    secondaryCta: "Contacter le cabinet",
    reassurance:
      "Cabinet à Seysses • Soins sur rendez-vous • Urgences selon disponibilité",
  },
  aboutDoctor: {
    title: "Le praticien",
    text:
      "Le Docteur Charlotte Gendre vous reçoit dans un cadre calme et professionnel. L’objectif : vous proposer des soins adaptés, expliqués, et réalisés avec rigueur.",
    reserved:
      "Zone réservée : diplômes, formations, spécialisations, équipements (à compléter).",
  },
  aboutOffice: {
    title: "Le cabinet",
    text:
      "Un environnement soigné, une hygiène irréprochable et un parcours patient fluide. Le cabinet s’attache à instaurer un climat de confiance, notamment pour les patients anxieux.",
    images: [
      {
        src: "https://images.unsplash.com/photo-1629909613638-0e4a1fad8f81?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwyfHxjYWJpbmV0JTIwZGVudGFpcmUlMjBtb2Rlcm5lfGVufDB8fHx8MTc2NTk4NDI3MXww&ixlib=rb-4.1.0&q=85",
        alt: "Salle de soins dentaire moderne",
        label: "Salle de soins",
      },
      {
        src: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2NzB8MHwxfHNlYXJjaHwxfHxjYWJpbmV0JTIwZGVudGFpcmUlMjBtb2Rlcm5lfGVufDB8fHx8MTc2NTk4NDI3MXww&ixlib=rb-4.1.0&q=85",
        alt: "Fauteuil dentaire",
        label: "Équipement",
      },
    ],
  },
  services: {
    title: "Soins & prestations",
    intro:
      "Les contenus ci-dessous sont des emplacements modifiables : vous pourrez ajouter, retirer ou préciser chaque soin selon les besoins du cabinet.",
    categories: [
      {
        id: "prevention",
        name: "Prévention",
        items: [
          {
            title: "Bilan et conseils personnalisés",
            description:
              "Évaluation, explications, et recommandations adaptées à votre hygiène bucco-dentaire.",
          },
          {
            title: "Détartrage",
            description:
              "Entretien régulier visant à limiter l’inflammation gingivale et les problèmes parodontaux.",
          },
        ],
      },
      {
        id: "soins",
        name: "Soins dentaires",
        items: [
          {
            title: "Traitement des caries",
            description:
              "Soins conservateurs, réalisés avec précision et explications étape par étape.",
          },
          {
            title: "Endodontie (dévitalisation)",
            description:
              "Prise en charge lorsque la pulpe est atteinte, dans le respect du confort du patient.",
          },
        ],
      },
      {
        id: "esthetique",
        name: "Esthétique",
        items: [
          {
            title: "Éclaircissement (blanchiment)",
            description:
              "Option esthétique à discuter en consultation (indications, contre-indications, suivi).",
          },
          {
            title: "Facettes / restaurations esthétiques",
            description:
              "Solutions sur-mesure, selon l’indication clinique et vos objectifs.",
          },
        ],
      },
    ],
  },
  practical: {
    title: "Informations pratiques",
    accessNote:
      "Vous pouvez appeler le cabinet pour toute question. En cas de douleur aiguë, expliquez vos symptômes : nous vous orienterons au mieux selon les disponibilités.",
    hours: [
      {
        day: "Lundi",
        hours: "09:00–13:30 / 14:30–19:00",
      },
      { day: "Mardi", hours: "08:00–16:30" },
      { day: "Mercredi", hours: "09:00–19:00" },
      { day: "Jeudi", hours: "Fermé" },
      { day: "Vendredi", hours: "08:00–19:00" },
      { day: "Samedi", hours: "Fermé" },
      { day: "Dimanche", hours: "Fermé" },
    ],
  },
  contact: {
    title: "Contact",
    formIntro:
      "Vous pouvez nous écrire via ce formulaire. Pour une demande urgente, privilégiez l’appel téléphonique.",
    rgpdNotice:
      "En envoyant ce formulaire, vous acceptez que les informations saisies soient utilisées pour répondre à votre demande. Données conservées le temps du traitement.",
  },
  faq: {
    title: "Questions fréquentes",
    items: [
      {
        q: "Le cabinet prend-il de nouveaux patients ?",
        a: "Zone réservée : à préciser selon la disponibilité. Vous pouvez appeler le cabinet pour confirmation.",
      },
      {
        q: "Proposez-vous des rendez-vous d’urgence ?",
        a: "Selon les disponibilités du jour. En cas de douleur importante, contactez-nous par téléphone.",
      },
      {
        q: "Comment préparer ma première consultation ?",
        a: "Apportez votre carte Vitale, votre mutuelle et, si possible, tout élément médical utile (ordonnances, radios récentes).",
      },
    ],
  },
  legal: {
    title: "Mentions légales & confidentialité",
    intro:
      "Ce contenu est fourni à titre de base et devra être complété avec les informations légales du cabinet (SIRET, RPPS, hébergeur, email, etc.).",
    sections: [
      {
        title: "Éditeur du site",
        content:
          "Docteur Charlotte Gendre – Chirurgien-Dentiste\nAdresse : 680 Route de Toulouse, 31600 Seysses, France\nTéléphone : 05 62 20 47 53\nEmail : (à compléter)",
      },
      {
        title: "Hébergement",
        content: "(à compléter : nom, adresse et contact de l’hébergeur)",
      },
      {
        title: "Données personnelles (RGPD)",
        content:
          "Les données collectées via le formulaire de contact sont destinées uniquement à répondre à votre demande. Vous pouvez demander l’accès, la rectification ou la suppression de vos données en contactant le cabinet (email à compléter).",
      },
      {
        title: "Cookies",
        content:
          "Ce site peut utiliser des cookies techniques nécessaires au bon fonctionnement. Aucun cookie publicitaire n’est mis en place par défaut.",
      },
    ],
  },
};

export function loadContent() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONTENT;
    const parsed = JSON.parse(raw);
    return deepMerge(DEFAULT_CONTENT, parsed);
  } catch {
    return DEFAULT_CONTENT;
  }
}

export function saveContent(next) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function loadMessages() {
  try {
    const raw = localStorage.getItem(MSG_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveMessage(msg) {
  const prev = loadMessages();
  const next = [msg, ...prev].slice(0, 20);
  localStorage.setItem(MSG_KEY, JSON.stringify(next));
  return next;
}

function isObject(v) {
  return v && typeof v === "object" && !Array.isArray(v);
}

function deepMerge(base, override) {
  if (Array.isArray(base) || Array.isArray(override)) return override ?? base;
  if (!isObject(base) || !isObject(override)) return override ?? base;

  const out = { ...base };
  for (const key of Object.keys(override)) {
    if (key in base) out[key] = deepMerge(base[key], override[key]);
    else out[key] = override[key];
  }
  return out;
}
