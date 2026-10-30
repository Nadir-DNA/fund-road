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

// Page vitrine des financeurs (fonds, business angels, réseaux, incubateurs)
export const financeursPage = {
  title: "Suivez chaque startup, de la candidature au portefeuille.",
  intro:
    "Fonds, business angels, réseaux et incubateurs : recevez des dossiers structurés selon vos critères, voyez leur complétude et leur adéquation, puis suivez chaque startup jusqu’à l’investissement. Gratuit pendant le lancement.",
  points: [
    "Gratuit pendant le lancement",
    "Adéquation à vos critères vérifiée par l’IA",
    "Fiche publique dans l’annuaire",
  ],
  steps: [
    {
      t: "Publiez vos critères",
      s: "Thèse, secteurs, stade, géographie, ticket, exclusions, pièces demandées et questions. Votre portail de candidature et votre fiche d’annuaire se mettent à jour aussitôt.",
      pts: [
        "Logo et couleur de votre organisation",
        "Pièces et questions propres à votre fonds",
        "Fiche publique fund-road.com/fonds/votre-nom",
      ],
      img: "/screens/fiche-fonds.webp",
      h: 639,
      alt: "Fiche publique d’un fonds : ticket, stade, zone, secteurs et pièces demandées",
    },
    {
      t: "Recevez des dossiers déjà vérifiés",
      s: "Chaque dossier reçu est comparé à vos critères par l’IA, avec la citation qui justifie chaque point. Les pièces manquantes et les critères bloquants sont signalés avant votre première lecture.",
      pts: [
        "Questions envoyées directement à la startup",
        "Pièces partagées téléchargeables",
        "Notes privées réservées à votre équipe",
      ],
      img: "/screens/dossier-recu.webp",
      h: 733,
      alt: "Dossier reçu par un fonds : questions du financeur, pièces partagées et notes privées",
    },
    {
      t: "Suivez vos startups dans le temps",
      s: "Un tableau de suivi pour tout votre flux : complétude de chaque dossier, avancement depuis le dernier envoi, adéquation à vos critères et étape de suivi.",
      pts: [
        "Étapes : nouveau, en revue, rendez-vous, due diligence, en portefeuille",
        "Repère quand une startup a fait avancer son dossier",
        "Incubateurs : toutes vos startups accompagnées au même endroit",
      ],
      img: "/screens/pipeline.webp",
      h: 956,
      alt: "Tableau de suivi d’un fonds : startups suivies, complétude moyenne, adéquation et étapes",
    },
  ],
  features: [
    [
      "Confidentialité respectée",
      "Vous voyez la version que la startup vous a partagée. De son dossier en cours, seul le pourcentage d’avancement vous parvient.",
    ],
    [
      "Toute votre équipe",
      "Invitez vos associés et analystes, avec des rôles distincts pour éditer ou seulement consulter.",
    ],
    [
      "Visible sur Google",
      "Votre fiche d’annuaire est une page publique, pensée pour apparaître quand une startup cherche votre nom.",
    ],
    [
      "Aucune commission",
      "Fund Road ne prend rien sur les levées ni sur les subventions obtenues.",
    ],
  ] as [string, string][],
  faq: [
    [
      "Combien coûte l’espace financeur ?",
      "Rien pendant le lancement : suivi, portail, critères, pièces demandées et notes d’équipe sont gratuits pour les fonds, business angels, réseaux et incubateurs.",
    ],
    [
      "Comment les startups me trouvent-elles ?",
      "Par votre lien de candidature, que vous partagez où vous voulez, et par l’annuaire Fund Road, où votre fiche publique reprend vos critères et vos pièces demandées.",
    ],
    [
      "Que vois-je du dossier d’une startup ?",
      "La version datée qu’elle vous a partagée, avec les pièces choisies. Tant que le partage est actif, vous voyez aussi le pourcentage d’avancement de son dossier, jamais son contenu en cours.",
    ],
    [
      "L’IA décide-t-elle à ma place ?",
      "Non. Elle vérifie chacun de vos critères avec une citation à l’appui et signale ce qui manque. La décision reste entièrement la vôtre.",
    ],
  ] as [string, string][],
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
