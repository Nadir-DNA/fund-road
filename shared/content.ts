// Textes publics partagés : affichés par React et écrits dans le HTML servi aux moteurs (SEO/GEO)
export const publicCopy: Record<
  string,
  // legal : texte juridique affiché en sections continues, sans appel à l'action
  { kicker: string; title: string; intro: string; items: [string, string][]; legal?: boolean }
> = {
  "mentions-legales": {
    kicker: "MENTIONS LÉGALES",
    title: "Mentions légales",
    intro: "Qui édite fund-road.com, où le service est hébergé et à qui s’adresser.",
    legal: true,
    items: [
      ["Éditeur", "Le site fund-road.com et le service Fund Road sont édités par Nadir DAOUDI, entrepreneur individuel (micro-entreprise) exerçant sous le nom commercial DigitalDNA. Siège : 7 rue de Madagascar, 13006 Marseille. SIRET : 890 997 349 00026. TVA non applicable, article 293 B du CGI. Contact : contact@fund-road.com."],
      ["Directeur de la publication", "Nadir DAOUDI."],
      ["Hébergement", "Le service et les données sont hébergés en France sur un serveur exploité par l’éditeur (coordonnées ci-dessus). L’acheminement du trafic est assuré par Cloudflare, Inc., 101 Townsend Street, San Francisco, CA 94107, États-Unis."],
      ["Propriété intellectuelle", "Le nom et la marque Fund Road, le site, ses textes, son code et sa présentation appartiennent à l’éditeur. Toute reproduction sans autorisation écrite est interdite. Les fiches de l’annuaire citent leurs sources publiques ; un financeur peut demander la correction ou le retrait de sa fiche à contact@fund-road.com."],
      ["Responsabilité", "Fund Road organise les informations fournies par ses utilisateurs et en contrôle la cohérence documentaire. Le service ne garantit ni l’obtention d’un financement, ni l’éligibilité à une aide, ni l’exactitude des documents déposés."],
      ["Données personnelles et cookies", "Voir la politique de confidentialité (/confidentialite) et la page Vos données (/confiance). Le choix des cookies se modifie à tout moment depuis « Gérer les cookies » en pied de page."],
    ],
  },
  cgv: {
    kicker: "CONDITIONS GÉNÉRALES",
    title: "Conditions générales de vente et d’utilisation",
    intro: "Les règles d’usage de Fund Road et les conditions d’achat de l’offre Dossier. Version du 1er novembre 2026.",
    legal: true,
    items: [
      ["1. Objet", "Les présentes conditions régissent l’usage de fund-road.com (« le Service ») par les startups, entreprises et financeurs (« l’Utilisateur ») et la vente des offres payantes par Nadir DAOUDI, entrepreneur individuel (DigitalDNA), SIRET 890 997 349 00026 (« l’Éditeur »). Créer un compte vaut acceptation de ces conditions."],
      ["2. Clientèle professionnelle", "Le Service est réservé aux professionnels (sociétés, entrepreneurs, financeurs) agissant pour les besoins de leur activité. En créant un compte, l’Utilisateur déclare agir à ce titre."],
      ["3. Offres et prix", "Découverte : gratuite, une analyse IA par mois. Dossier : 149 € pour 90 jours d’accès, paiement unique, sans renouvellement automatique. Espace financeur : gratuit pendant la période de lancement. TVA non applicable, article 293 B du CGI. Fund Road ne prélève aucune commission sur les financements obtenus."],
      ["4. Paiement et accès", "Le paiement s’effectue en ligne par carte via Stripe. L’accès à l’offre est ouvert dès la confirmation du paiement, pour la durée indiquée. Une facture est émise pour chaque achat."],
      ["5. Absence de droit de rétractation", "L’offre étant réservée aux professionnels, le droit de rétractation prévu par le Code de la consommation ne s’applique pas. L’accès commence dès le paiement à la demande de l’Utilisateur."],
      ["6. Engagements de l’Utilisateur", "L’Utilisateur garantit disposer des droits sur les documents qu’il dépose et l’exactitude de ses déclarations. Il s’interdit de déposer des contenus illicites, contrefaisants ou contenant du code actif, et de tenter d’accéder aux données d’autres utilisateurs."],
      ["7. Nature du service", "Le Service structure un dossier à partir des documents et déclarations de l’Utilisateur. Les extractions, évaluations et relectures automatisées sont des aides à la préparation : elles peuvent comporter des erreurs et doivent être relues et confirmées. Le score mesure la complétude documentaire, pas les chances de financement. L’attestation porte sur une version datée et un référentiel ; elle ne certifie pas l’authenticité des pièces. Aucune décision de financement n’est prise par Fund Road."],
      ["8. Responsabilité", "La responsabilité de l’Éditeur est limitée aux dommages directs prouvés et plafonnée au montant payé par l’Utilisateur au cours des douze derniers mois. Elle ne peut être engagée pour un refus de financement, une décision d’un tiers ou une perte de chance."],
      ["9. Disponibilité", "L’Éditeur s’efforce d’assurer l’accès au Service sans garantir une disponibilité continue. Des interruptions pour maintenance ou incident peuvent survenir ; les données sont sauvegardées chaque jour."],
      ["10. Données personnelles", "Le traitement des données est décrit dans la politique de confidentialité (/confidentialite)."],
      ["11. Fin du contrat", "L’Utilisateur peut supprimer son compte à tout moment depuis la page Sécurité de son espace. Les sommes versées pour une période entamée ne sont pas remboursées. L’Éditeur peut suspendre un compte en cas de manquement grave à ces conditions, après information préalable sauf urgence."],
      ["12. Droit applicable", "Les présentes conditions sont soumises au droit français. À défaut d’accord amiable, tout litige relève des tribunaux de Marseille."],
    ],
  },
  confidentialite: {
    kicker: "CONFIDENTIALITÉ",
    title: "Politique de confidentialité",
    intro: "Quelles données Fund Road traite, pourquoi, avec qui, combien de temps, et comment exercer vos droits. Version du 1er novembre 2026.",
    legal: true,
    items: [
      ["Responsable du traitement", "Nadir DAOUDI, entrepreneur individuel (DigitalDNA), 7 rue de Madagascar, 13006 Marseille. Contact : contact@fund-road.com."],
      ["Compte", "Nom, adresse email, mot de passe haché et, si vous l’activez, double authentification. Finalité : accès au Service. Base légale : exécution du contrat. Durée : celle du compte."],
      ["Documents et dossiers", "Documents déposés, textes extraits, rubriques, versions, partages et notes. Finalité : préparer et partager votre dossier. Base légale : exécution du contrat. Durée : jusqu’à la suppression du dossier ou du compte."],
      ["Analyse par l’IA", "Quand vous lancez une analyse ou partagez un dossier avec un financeur dont les critères sont évalués, le texte extrait de vos documents (jamais les fichiers) est transmis au fournisseur d’IA OpenCode (opencode.ai), qui l’achemine vers le modèle DeepSeek. Ces traitements peuvent avoir lieu hors de l’Union européenne. Aucune analyse n’est lancée sans votre action."],
      ["Facturation", "Achats et factures, traités avec Stripe. Base légale : obligation légale. Durée : 10 ans."],
      ["Mesure d’audience", "Google Analytics, uniquement après votre accord dans la bannière cookies. Durée des cookies : 14 mois au plus. Modifiable à tout moment via « Gérer les cookies »."],
      ["Sécurité et sauvegardes", "Connexions chiffrées, mots de passe hachés, contrôle des fichiers déposés, accès cloisonné par organisation et par dossier, journal des actions sensibles. Sauvegarde quotidienne conservée 14 jours."],
      ["Destinataires", "Vous seul et les membres de votre organisation, puis les financeurs ou contacts avec lesquels vous partagez un dossier, limités aux pièces choisies et à la version partagée. Sous-traitants techniques : Cloudflare (acheminement réseau), OpenCode (IA), Stripe (paiement), Google (mesure d’audience, sur accord). Aucune donnée n’est vendue."],
      ["Vos droits", "Accès, rectification, effacement, limitation, opposition et portabilité. Votre compte se supprime vous-même depuis la page Sécurité ; les autres demandes s’adressent à contact@fund-road.com et sont traitées sous un mois. Vous pouvez saisir la CNIL (cnil.fr)."],
    ],
  },
  entrepreneurs: {
    kicker: "ENTREPRENEURS",
    title: "Un dossier qui travaille avec vous",
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
    title: "Votre portail. Votre façon d’investir",
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
    kicker: "RÉFÉRENTIEL FUND ROAD",
    title: "La confiance commence par la clarté",
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
    title: "Recommandez un parcours utile",
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
    kicker: "VOS DONNÉES",
    title: "Vos données : ce qui part, à qui, et pour combien de temps",
    intro:
      "Vos documents servent à construire votre dossier, rien d’autre. Voici exactement ce qu’ils deviennent et comment les effacer. Pour toute question ou demande : contact@fund-road.com.",
    items: [
      [
        "Où sont vos documents",
        "Vos fichiers et votre dossier sont stockés sur le serveur de Fund Road. Les échanges avec le site passent en HTTPS. Personne d’autre que vous et les membres que vous invitez n’y a accès depuis le site ; l’administrateur technique peut y accéder pour la maintenance et la sécurité.",
      ],
      [
        "Ce qui part à l’IA",
        "Seul le texte extrait de vos documents est envoyé, jamais les fichiers, à notre fournisseur d’IA (OpenCode, modèle DeepSeek), avec la consigne de ne pas conserver la requête. Cela arrive quand vous lancez une analyse, et quand vous partagez votre dossier avec un financeur inscrit pour vérifier ses critères.",
      ],
      [
        "Qui voit votre dossier",
        "Un financeur ne voit votre dossier que si vous le partagez avec lui, nominativement, avec les pièces choisies. Vous pouvez révoquer ce partage à tout moment ; les copies qu’il a déjà téléchargées ne peuvent pas être effacées à distance.",
      ],
      [
        "Combien de temps",
        "Vos dossiers sont conservés tant que votre compte existe. Les sauvegardes du serveur sont conservées 14 jours, puis effacées : une donnée supprimée disparaît donc aussi des sauvegardes sous 14 jours.",
      ],
      [
        "Supprimer un dossier ou votre compte",
        "Le bouton « Supprimer » d’un dossier efface immédiatement ses documents, ses versions et ses partages. Votre compte se supprime vous-même depuis Sécurité, mot de passe à l’appui ; à défaut, écrivez à contact@fund-road.com (traitement sous 30 jours). Les données de facturation sont conservées 10 ans, comme l’impose la loi.",
      ],
      [
        "Mesure d’audience",
        "Google Analytics n’est chargé qu’après votre accord, donné ou refusé dans la bannière. Vous pouvez changer d’avis à tout moment avec le lien « Gérer les cookies » en bas de chaque page.",
      ],
    ],
  },
  ressources: {
    kicker: "RESSOURCES",
    title: "Préparer les bonnes informations",
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
  title: "Suivez chaque startup, de la candidature au portefeuille",
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
        "Déposez business plan et deck : Fund Road structure un dossier de financement sourcé, montre ce qui manque et vous aide à le partager aux fonds.",
    },
    "/tarifs": {
      title: "Tarifs Fund Road : gratuit pour commencer, 149 € par dossier",
      description:
        "Startups : offre Découverte gratuite, dossier complet à 149 € pour 90 jours. Gratuit pour fonds, business angels et incubateurs pendant le lancement.",
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
    "/mentions-legales": {
      title: "Mentions légales | Fund Road",
      description:
        "Éditeur, hébergement et contact de fund-road.com, le service de préparation de dossiers de financement pour startups.",
    },
    "/cgv": {
      title: "Conditions générales de vente | Fund Road",
      description:
        "Offres, prix, paiement, responsabilités et nature du service Fund Road. Réservé aux professionnels, sans commission sur les financements.",
    },
    "/confidentialite": {
      title: "Politique de confidentialité | Fund Road",
      description:
        "Données traitées, finalités, durées, sous-traitants dont le fournisseur d’IA, et vos droits sur Fund Road.",
    },
    "/confiance": {
      title: "Vos données et RGPD : IA, accès, suppression | Fund Road",
      description:
        "Ce qui est envoyé à l’IA, qui voit votre dossier, combien de temps il est conservé et comment le supprimer : la politique de données de Fund Road.",
    },
    "/ressources": {
      title: "Guides levée de fonds et subvention | Fund Road",
      description:
        "Ce qu’un financeur vous demandera : activité, preuves, besoin de financement. Guides pratiques pour startups.",
    },
  };
