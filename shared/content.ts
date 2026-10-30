// Textes publics partagés : affichés par React et écrits dans le HTML servi aux moteurs (SEO/GEO)
export const publicCopy: Record<
  string,
  { kicker: string; title: string; intro: string; items: [string, string][] }
> = {
  entrepreneurs: {
    kicker: "ENTREPRENEURS",
    title: "Un dossier qui travaille avec vous.",
    intro:
      "Réutilisez vos informations pour préparer vos demandes d’investissement et de subvention.",
    items: [
      [
        "Un point de départ simple",
        "Importez un PDF, un document Word, un pitch PowerPoint ou un tableur Excel.",
      ],
      [
        "Des questions ciblées",
        "Complétez les rubriques prioritaires et confirmez les informations extraites.",
      ],
      [
        "Un partage maîtrisé",
        "Une version datée, des pièces choisies et un accès nominatif révocable.",
      ],
    ],
  },
  financeurs: {
    kicker: "BUSINESS ANGELS & FONDS",
    title: "Concentrez-vous sur les projets.",
    intro:
      "Vos critères structurent les candidatures. L’IA vous aide à préparer les questions et les synthèses.",
    items: [
      [
        "Deux portes d’entrée",
        "Importez des documents reçus ou invitez les startups à compléter leur dossier.",
      ],
      [
        "Votre cadre d’analyse",
        "Thèse, secteur, stade, géographie, tickets et questions spécifiques.",
      ],
      [
        "Vos échanges, au bon endroit",
        "Distinguez les questions partagées et les notes réservées à votre équipe.",
      ],
    ],
  },
  "marque-blanche": {
    kicker: "VOTRE MARQUE",
    title: "Votre portail. Votre façon d’investir.",
    intro:
      "Un espace de candidature personnalisé, construit sur le même moteur documentaire.",
    items: [
      [
        "Identité",
        "Nom, couleur, présentation et parcours propres à votre organisation.",
      ],
      [
        "Critères",
        "Paramétrez votre thèse et vos questions sans développement spécifique.",
      ],
      [
        "Domaine personnalisé",
        "Activation accompagnée après vérification de propriété et configuration HTTPS.",
      ],
    ],
  },
  referentiel: {
    kicker: "RÉFÉRENTIEL FUNDROAD",
    title: "La confiance commence par la clarté.",
    intro:
      "Le score mesure la complétude documentaire. Il ne mesure pas la probabilité de financement.",
    items: [
      [
        "Complétude",
        "Neuf rubriques documentées et confirmées, avec les pièces et exigences applicables.",
      ],
      [
        "Contrôles automatisés",
        "Les sources et incohérences sont examinées. Les informations inconnues restent à compléter.",
      ],
      [
        "Attestation datée",
        "L’attestation concerne une version et un référentiel. Elle ne certifie ni l’authenticité des documents ni la qualité d’un investissement.",
      ],
    ],
  },
  partenaires: {
    kicker: "PARTENAIRES",
    title: "Recommandez un parcours utile.",
    intro:
      "Deux programmes distincts, avec des conditions explicites avant activation.",
    items: [
      [
        "Parrainage startup",
        "Une réduction pour la startup invitée et une remise sur un prochain achat pour la startup marraine.",
      ],
      [
        "Affiliation fonds",
        "Le contrat, le code et les commissions sont rattachés à l’organisation. Aucun versement personnel aux salariés.",
      ],
      [
        "Indépendance",
        "La rémunération ne modifie jamais le score, l’attestation ou la décision d’investissement.",
      ],
    ],
  },
  confiance: {
    kicker: "DONNÉES & CONFIANCE",
    title: "Vos documents restent sous contrôle.",
    intro:
      "Comptes et documents sont hébergés par Fund Road. Seuls les extraits utiles à l’analyse sont transmis à notre fournisseur d’IA.",
    items: [
      [
        "Accès limités",
        "Chaque espace dispose de permissions propres. Un lien de parrainage ne donne aucun accès aux dossiers.",
      ],
      [
        "Partage nominatif",
        "Choisissez les destinataires et révoquez leurs accès futurs. Les copies déjà téléchargées ne peuvent pas être effacées à distance.",
      ],
      [
        "Traçabilité",
        "Chaque information du dossier garde sa source : le document et la citation exacte dont elle provient.",
      ],
    ],
  },
  ressources: {
    kicker: "RESSOURCES",
    title: "Préparer les bonnes informations.",
    intro:
      "Les guides détaillés arrivent. Voici déjà ce qu’un financeur vous demandera.",
    items: [
      [
        "Votre activité",
        "Présentation, équipe, problème résolu, offre et modèle économique.",
      ],
      [
        "Vos preuves",
        "Traction datée, contrats partageables, finances réalisées et hypothèses prévisionnelles.",
      ],
      [
        "Votre demande",
        "Montant, forme, calendrier, répartition et jalons attendus.",
      ],
    ],
  },
};

export const faq: [string, string][] = [
  [
    "Fund Road garantit-il un financement ?",
    "Non. Le score mesure la complétude de votre dossier, pas vos chances. La décision appartient toujours au financeur.",
  ],
  [
    "Que fait l’IA de mes documents ?",
    "Elle lit le texte extrait pour proposer les rubriques, avec une citation exacte pour chacune. Rien n’est validé sans vous et rien n’est partagé sans votre choix.",
  ],
  [
    "Et si une information manque dans mes documents ?",
    "Elle reste marquée « à compléter ». Fund Road n’invente aucun chiffre et sépare clairement les hypothèses des faits sourcés.",
  ],
  [
    "Puis-je l’utiliser pour une subvention ?",
    "Oui. Le même dossier sert pour une levée, un prêt d’honneur ou une demande de subvention, avec les questions propres à chaque organisme.",
  ],
];

// Titre et description par page publique (balises <title>, meta description, Open Graph)
export const pageMeta: Record<string, { title: string; description: string }> =
  {
    "/": {
      title: "Fund Road : dossier de levée de fonds et subvention sourcé",
      description:
        "Déposez business plan et deck : Fund Road structure un dossier de financement sourcé, vérifie l’éligibilité aux aides (BFT, i-Lab) et le partage aux fonds.",
    },
    "/tarifs": {
      title: "Tarifs Fund Road : gratuit pour commencer, 149 € par dossier",
      description:
        "Startups : offre Découverte gratuite, dossier complet à 149 € HT pour 90 jours. Gratuit pour fonds, business angels et incubateurs pendant le lancement.",
    },
    "/annuaire": {
      title: "Annuaire des fonds et business angels | Fund Road",
      description:
        "Critères, tickets et pièces demandées par les fonds d’investissement, business angels, réseaux et incubateurs. Préparez votre candidature.",
    },
    "/entrepreneurs": {
      title: "Préparer son dossier de financement de startup | Fund Road",
      description:
        "Un seul dossier pour vos levées de fonds, prêts d’honneur et subventions : import de vos documents, rubriques sourcées, partage révocable.",
    },
    "/financeurs": {
      title: "Fonds et business angels : dossiers structurés | Fund Road",
      description:
        "Recevez des candidatures structurées selon vos critères, suivez la complétude de chaque startup et gardez vos notes privées. Gratuit pendant le lancement.",
    },
    "/marque-blanche": {
      title: "Portail de candidature en marque blanche | Fund Road",
      description:
        "Un portail de candidature à vos couleurs pour votre fonds, réseau ou incubateur, avec vos critères et vos questions.",
    },
    "/referentiel": {
      title: "Référentiel d’un dossier de financement | Fund Road",
      description:
        "Les neuf rubriques d’un dossier de financement complet, les contrôles automatisés et ce que l’attestation de complétude certifie ou non.",
    },
    "/partenaires": {
      title: "Programme partenaires et parrainage | Fund Road",
      description:
        "Parrainage entre startups et affiliation pour les fonds : conditions explicites, sans effet sur le score ni sur la décision d’investissement.",
    },
    "/confiance": {
      title: "Données et confidentialité de vos documents | Fund Road",
      description:
        "Hébergement, accès limités, partage nominatif et traçabilité des sources : comment Fund Road protège vos documents de financement.",
    },
    "/ressources": {
      title: "Guides levée de fonds et subvention | Fund Road",
      description:
        "Ce qu’un financeur vous demandera : activité, preuves, besoin de financement. Guides pratiques pour startups.",
    },
  };
