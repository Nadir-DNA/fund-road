# Recherche de financeurs pour l'annuaire

Procédure pour remplir l'annuaire de fund-road.com :

1. Lancer le prompt ci-dessous dans ChatGPT, en mode **Deep research**, **une fois par lot** (voir « Lots conseillés »).
2. Enregistrer chaque réponse en fichier `.json`.
3. Faire un essai à blanc de l'import :
   ```bash
   npx tsx --env-file=.env.local scripts/import-financeurs.ts lot-1.json
   ```
4. Lire le rapport `lot-1.rapport.json`.
5. Importer pour de bon :
   ```bash
   npx tsx --env-file=.env.local scripts/import-financeurs.ts lot-1.json --ecrire
   ```

L'import ne publie une fiche que si sa page source répond et cite le financeur. Les autres sont enregistrées masquées et listées dans le rapport. Les listes ci-dessous doivent rester identiques à `shared/criteria.ts` : une valeur hors liste fait rejeter la fiche.

En production, depuis le dossier du projet, monter le fichier dans le conteneur :
```bash
/home/dna/.local/docker/docker compose -p fundroad-prod -f compose.prod.yaml --env-file .env.production run --rm -v "$PWD/lot-1.json:/tmp/lot.json:ro" api npx tsx scripts/import-financeurs.ts /tmp/lot.json
```
Ajouter `--ecrire` à la fin une fois le rapport relu. Le rapport est écrit dans le conteneur : relire la sortie affichée.

## Prompt unique

Le prompt à copier est dans `docs/prompt-financeurs.txt` : un seul copier-coller couvre fonds, business angels, réseaux, incubateurs et aides. Quand la réponse s'arrête, taper « continue » ; enregistrer chaque réponse dans un fichier `.json`, telle quelle (le texte autour du tableau est ignoré à l'import).

## Ancien prompt détaillé par lot (référence)


```text
Tu es analyste en financement de startups. Fais une recherche approfondie sur le web pour constituer la liste la plus complète et la plus fiable possible de financeurs pour ce lot : [LOT].

OBJECTIF
Chaque financeur deviendra une fiche publique d'un annuaire destiné aux startups françaises. La fiabilité prime sur la quantité : une fiche fausse est pire qu'une fiche absente.

RÈGLES DE FIABILITÉ, À RESPECTER STRICTEMENT
1. N'invente rien. Si une information n'est pas trouvée dans une source publique, mets null (ou une liste vide), jamais une estimation.
2. "source_url" est obligatoire : une page https officielle du financeur (de préférence sa page thèse, critères, programme ou candidature) qui cite son nom. Pas d'agrégateur (Crunchbase, Dealroom, LinkedIn, annuaires tiers) comme source principale, sauf si le financeur n'a pas de site, auquel cas exclus-le.
3. Exclus les structures fermées, en liquidation, qui n'investissent plus, ou dont le site ne répond plus.
4. Montants en euros, en nombres entiers (500000 et non "500 k€"). Si la source est en dollars ou dans une autre devise, convertis au taux du jour et arrondis au millier.
5. Utilise UNIQUEMENT les valeurs des listes ci-dessous, écrites exactement à l'identique (accents, espaces, barres obliques compris). Si rien ne correspond, n'ajoute pas de valeur.
6. Vérifie chaque fiche individuellement. Ne déduis pas les critères d'un fonds à partir d'un autre.

TYPES ("type")
- "fund" : fonds de capital-risque ou de capital-développement (VC, CVC, family office qui investit en startups)
- "angel" : business angel individuel, avec une page publique d'investisseur
- "network" : réseau ou club de business angels
- "incubator" : incubateur, accélérateur, startup studio
- "grant" : organisme d'aide publique ou privée (subvention, prêt d'honneur, concours, avance remboursable)

LISTES FIXES
Secteurs ("sectors", plusieurs possibles ; "Généraliste" si le financeur n'a pas de restriction sectorielle) :
"Généraliste", "Logiciel / SaaS", "Intelligence artificielle", "Fintech / Assurtech", "Santé / Medtech", "Biotech", "Climat / Énergie", "Industrie / Deeptech", "Mobilité / Logistique", "Agritech / Alimentation", "Commerce / E-commerce", "Grande consommation", "Immobilier / Construction", "Éducation", "RH / Travail", "Cybersécurité", "Médias / Culture", "Tourisme / Loisirs", "Impact / ESS", "Spatial / Défense"

Stades ("stages", plusieurs possibles) :
"Idée", "Prototype", "Pré-amorçage", "Amorçage", "Série A", "Série B et plus", "Croissance"

Zones ("regions", plusieurs possibles ; "France entière" si toute la France ; "International" si aucune restriction géographique) :
"France entière", "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Bretagne", "Centre-Val de Loire", "Corse", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandie", "Nouvelle-Aquitaine", "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d’Azur", "Outre-mer", "Europe", "Amérique du Nord", "Afrique", "Moyen-Orient", "Asie", "International"
(Attention : l'apostrophe de "Provence-Alpes-Côte d’Azur" est typographique : ’)

CRITÈRES COMMUNS ("criteria")
- "sectors", "stages", "regions" : listes ci-dessus
- "ticketMin", "ticketMax" : ticket par entreprise en euros (pour une subvention : montant d'aide minimum et maximum)
- "exclusions" : texte court sur ce que le financeur exclut explicitement (ex. "Pas de B2C, pas de crypto"), sinon ""
- "questions" : liste (éventuellement vide) des questions que le financeur pose explicitement aux candidats dans son formulaire
- "documents" : liste (éventuellement vide) des pièces explicitement demandées (ex. "Pitch deck", "Prévisionnel financier sur 3 ans", "Kbis")
- "details" : objet propre au type, voir ci-dessous. Uniquement les clés listées pour le type. Valeur null si inconnue.

DÉTAILS PAR TYPE ("criteria.details")
Pour "fund" :
- "position" : "Mène les tours" | "Suit les tours" | "Mène ou suit"
- "reinvestit" : true | false (réinvestit aux tours suivants)
- "tractionMin" : texte, traction minimale exigée (ex. "100 k€ de revenu récurrent annuel")
- "tailleFonds" : texte (ex. "Fonds II de 150 M€, 2024")
- "delaiDecision" : texte (ex. "6 à 8 semaines")

Pour "angel" et "network" :
- "ticketTotal" : nombre en euros, montant total que le réseau peut réunir sur un tour
- "proximite" : texte, zone où il investit en priorité
- "implication" : "Mentorat" | "Rôle opérationnel" | "Financier uniquement"
- "coInvestissement" : true | false
- "comites" : texte, fréquence ou dates des comités de sélection
- "frais" : texte, frais de candidature éventuels (ex. "Gratuit", "500 € HT si sélectionné")

Pour "incubator" :
- "modele" : "Public" | "Privé" | "École / université" | "Corporate"
- "duree" : texte (ex. "12 mois")
- "dateLimite" : date "AAAA-MM-JJ" de la prochaine clôture de candidature, seulement si elle est future et publiée, sinon null
- "contrepartie" : "Gratuit" | "Frais" | "Part du capital" | "Frais et part du capital"
- "contrepartieDetail" : texte (ex. "6 % du capital", "300 € par mois")
- "presentiel" : true | false
- "acces" : texte, conditions d'accès (ex. "Réservé aux étudiants et alumni de l'école")
- "services" : texte court (hébergement, mentorat, levée, labellisation Bourse French Tech…)

Pour "grant" :
- "entreprise" : texte, conditions d'âge ou de taille (ex. "PME de moins de 1 an")
- "montantMax" : nombre en euros
- "tauxAide" : texte (ex. "70 % des dépenses éligibles")
- "autofinancement" : texte (ex. "Fonds propres au moins égaux à l'aide")
- "depenses" : texte, dépenses éligibles
- "innovation" : texte, niveau d'innovation attendu
- "dateLimite" : date "AAAA-MM-JJ" de la prochaine clôture, seulement si elle est future et publiée, sinon null

FORMAT DE SORTIE
Réponds UNIQUEMENT par un tableau JSON valide (fournis-le aussi en fichier .json téléchargeable si possible), sans texte avant ni après, sans commentaires. Une entrée par financeur, au format exact suivant :

[
  {
    "nom": "Nom officiel",
    "type": "fund",
    "description": "Deux phrases factuelles maximum : qui il est et ce qu'il finance. Pas de superlatifs.",
    "site": "https://site-officiel.fr",
    "source_url": "https://site-officiel.fr/page-qui-cite-les-criteres",
    "candidature_url": "https://site-officiel.fr/candidater",
    "criteria": {
      "sectors": ["Logiciel / SaaS"],
      "stages": ["Amorçage"],
      "regions": ["France entière"],
      "ticketMin": 300000,
      "ticketMax": 2000000,
      "exclusions": "",
      "questions": [],
      "documents": ["Pitch deck"],
      "details": {
        "position": "Mène les tours",
        "reinvestit": true,
        "tractionMin": null,
        "tailleFonds": null,
        "delaiDecision": null
      }
    }
  }
]

"candidature_url" vaut null s'il n'existe pas de formulaire ou d'adresse de candidature publique. Toutes les adresses commencent par https://.

AVANT DE RÉPONDRE, VÉRIFIE
- chaque "source_url" ouvre une page officielle qui cite le nom exact du financeur ;
- aucune valeur hors des listes fixes ;
- aucun doublon (même financeur sous deux noms) ;
- aucun montant ou critère inventé : en cas de doute, null.

Vise le maximum de financeurs fiables pour ce lot, en commençant par les plus actifs.
```
