import {
  UserRole,
  RoleInfo,
  BureauMember,
  Communique,
  Claim,
  CotisationRecord,
  FinancialSummary,
  UnionEvent,
  DocumentItem,
  RegistrationRecord,
} from "@/types";

export const ROLE_INFOS: Record<UserRole, RoleInfo> = {
  ceo: {
    code: "ceo",
    title: "Président",
    fullName: "Président du Bureau Syndical",
    description: "Représente légalement le bureau, conduit les négociations avec la Direction Générale du Centre Universitaire et garantit l'application des décisions.",
    badgeColor: "bg-emerald-700 text-white",
  },
  mast_in: {
    code: "mast_in",
    title: "Secrétaire Général",
    fullName: "Secrétaire Général (SE-G)",
    description: "Coordonne l'administration du bureau, gère la correspondance officielle et assure le suivi des comptes-rendus d'assemblées.",
    badgeColor: "bg-blue-700 text-white",
  },
  mast: {
    code: "mast",
    title: "Secrétaire Organisation",
    fullName: "Secrétaire à l'Organisation (S-ORG)",
    description: "Planifie, structure et supervise la logistique des mobilisations, assemblées générales et manifestations culturelles.",
    badgeColor: "bg-amber-700 text-white",
  },
  mix: {
    code: "mix",
    title: "Affaires Académiques",
    fullName: "Secrétaire aux Affaires Académiques & Culturelles",
    description: "Prend en charge les doléances d'ordre pédagogique, le calendrier des examens, les séances de révision et la vie académique.",
    badgeColor: "bg-indigo-700 text-white",
  },
  min: {
    code: "min",
    title: "Information & Com",
    fullName: "Secrétaire à l'Information & à la Communication",
    description: "Gère la communication officielle, la rédaction des communiqués de presse, l'affichage et la présence numérique du BS-Lokossa.",
    badgeColor: "bg-teal-700 text-white",
  },
  tg: {
    code: "tg",
    title: "Trésorier Général",
    fullName: "Trésorier Général",
    description: "Supervise les finances du bureau syndical, recouvre les cotisations des membres et prépare les rapports de transparence financière.",
    badgeColor: "bg-purple-700 text-white",
  },
  tga: {
    code: "tga",
    title: "Trésorier Adjoint",
    fullName: "Trésorier Général Adjoint",
    description: "Assiste le Trésorier Général dans la tenue de la comptabilité quotidienne et le contrôle des reçus de cotisations.",
    badgeColor: "bg-purple-600 text-white",
  },
  amc: {
    code: "amc",
    title: "Affaires Sociales & Matériel",
    fullName: "Chargé du Matériel & des Affaires Sociales",
    description: "Veille au bien-être social des étudiants (logement, santé, aides d'urgence) et gère le patrimoine matériel du bureau.",
    badgeColor: "bg-rose-700 text-white",
  },
};

export const INITIAL_BUREAU_MEMBERS: BureauMember[] = [
  {
    id: "mem-1",
    role: "ceo",
    name: "Comlan M. AGOSSA",
    filiere: "Génie Électrique & Informatique (ENSET)",
    niveau: "Master 2",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
    phone: "+229 97 42 18 90",
    email: "president.bslokossa@feua.bj",
    officeHours: "Lundi & Mercredi: 14h00 - 17h00 (Bâtiment BS)",
    bio: "Engagé pour la défense intransigeante des droits des étudiants de Lokossa et la modernisation des infrastructures du campus.",
  },
  {
    id: "mem-2",
    role: "mast_in",
    name: "Victoire T. KPADONOU",
    filiere: "Génie Civil & Fonderie (IUT Lokossa)",
    niveau: "Licence 3",
    photoUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
    phone: "+229 96 11 09 84",
    email: "sg.bslokossa@feua.bj",
    officeHours: "Mardi & Jeudi: 10h00 - 12h00",
    bio: "Garante de la rigueur administrative et du suivi permanent des délibérations avec la direction des études.",
  },
  {
    id: "mem-3",
    role: "min",
    name: "Romaric K. SOSSOU",
    filiere: "Génie Mécanique & Productique (ENSET)",
    niveau: "Licence 3",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    phone: "+229 95 88 23 10",
    email: "info.bslokossa@feua.bj",
    officeHours: "Du Lundi au Vendredi: 08h00 - 18h00 (En ligne)",
    bio: "Responsable de la clarté et de l'immédiateté des communiqués officiels diffusés aux étudiants.",
  },
  {
    id: "mem-4",
    role: "mix",
    name: "Aïcha S. HOUEDANOU",
    filiere: "Informatique de Gestion (IUT Lokossa)",
    niveau: "Licence 2",
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
    phone: "+229 61 22 45 67",
    email: "academique.bslokossa@feua.bj",
    officeHours: "Mercredi & Vendredi: 11h00 - 13h00",
    bio: "À l'écoute des préoccupations sur les notes d'examens, le tutorat académique et l'organisation des TD.",
  },
  {
    id: "mem-5",
    role: "tg",
    name: "Gérard A. DOSSOU",
    filiere: "Maintenance Industrielle (ENSET)",
    niveau: "Master 1",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
    phone: "+229 94 33 81 12",
    email: "tresorerie.bslokossa@feua.bj",
    officeHours: "Mardi & Vendredi: 15h00 - 17h00",
    bio: "Assure la saine gestion financière et la publication périodique des bilans de trésorerie du syndicat.",
  },
  {
    id: "mem-6",
    role: "amc",
    name: "Sèna B. HOUNKPATIN",
    filiere: "Génie Chimique (IUT Lokossa)",
    niveau: "Licence 3",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
    phone: "+229 97 00 14 55",
    email: "social.bslokossa@feua.bj",
    officeHours: "Chaque jour sur rdv d'urgence",
    bio: "Chargé d'accompagner les camarades en difficulté de santé, de logement ou de matériel de laboratoire.",
  },
];

export const INITIAL_COMMUNIQUES: Communique[] = [
  {
    id: "comm-001",
    title: "Report exceptionnel des compositions du 1er Semestre & Ouverture du Rectorat aux réclamations",
    referenceNumber: "N° 018/2026/BS-FEUA/LOK",
    category: "Académique",
    date: "2026-07-20",
    authorRole: "mix",
    authorName: "Aïcha S. HOUEDANOU (Secrétaire aux Affaires Académiques)",
    summary: "Suite aux démarches menées auprès de la Direction des Études, le calendrier des évaluations de rattrapage pour les étudiants de Licence 1 et 2 est décalé d'une semaine.",
    content: `Camarades étudiantes et étudiants de Lokossa,

Le Bureau Syndical de Lokossa (BS-FEUA) informe l'ensemble de la communauté universitaire que suite à la séance de concertation tenue ce mardi 19 Juillet 2026 entre la délégation syndicale et le Vice-Doyen chargé des affaires académiques:

1. Le démarrage des examens de rattrapage initialement prévu pour le 24 Juillet est reporté au Lundi 31 Juillet 2026.
2. Un guichet spécial de réclamation des notes manquantes de TP/TD est ouvert au Secrétariat Général de l'IUT et de l'ENSET jusqu'au Vendredi 28 Juillet à 17h00.
3. Les plannings révisés d'occupation des amphis (Amphi 500 et Salles B) seront affichés dès ce jeudi matin.

Le Bureau Syndical invite les camarades au calme et à la concentration maximale pour ces échéances capitales.

Pour le Bureau Syndical,
Le Secrétariat aux Affaires Académiques.`,
    isPinned: true,
    tags: ["Examens", "IUT", "ENSET", "Planning"],
  },
  {
    id: "comm-002",
    title: "Grande Assemblée Générale Ordinaire de Rentrée Syndicale - Bilan & Revendications",
    referenceNumber: "N° 017/2026/BS-FEUA/LOK",
    category: "Assemblé Générale",
    date: "2026-07-15",
    authorRole: "ceo",
    authorName: "Comlan M. AGOSSA (Président BS-Lokossa)",
    summary: "Ordre du jour: Restauration du réseau Wi-Fi campus, état des sanitaires, transport universitaire et vote de la feuille de route.",
    content: `Camarades Étudiants,

Face aux multiples défis d'infrastructures constatés sur le campus de Lokossa (défaillances répétées de l'électricité au niveau des blocs pédagogiques, connexion Internet instable et rareté des bus de liaison), le Président du Bureau Syndical vous convoque à :

LA GRANDE ASSEMBLÉE GÉNÉRALE ORDINAIRE

l'Amphithéâtre 500 du Campus de Lokossa
Ordre du jour :
- Point d'étape des négociations sur la bourse et les secours universitaires
- Problématique de l'éclairage des ateliers et amphis
- Présentation du rapport financier du 1er Semestre par le Trésorier Général
- Adoption de la motion de protestation pacifique

La présence de chaque étudiant est vivement recommandée pour faire entendre la voix collective.`,
    isPinned: true,
    tags: ["AG", "Mobilisation", "Revendications", "Amphi500"],
  },
  {
    id: "comm-003",
    title: "Campagne de Recouvrement de la Cotisation Syndicale Annuelle (2025-2026)",
    referenceNumber: "N° 015/2026/BS-FEUA/LOK",
    category: "Information",
    date: "2026-07-08",
    authorRole: "tg",
    authorName: "Gérard A. DOSSOU (Trésorier Général)",
    summary: "Rappel sur la cotisation statutaire fixée à 500 FCFA par étudiant. Modalités de paiement physique et en ligne.",
    content: `Chers camarades,

La cotisation syndicale est le levier d'indépendance financière du BS-Lokossa. Elle permet de financer :
- L'assistance sociale d'urgence aux camarades hospitalisés ou nécessiteux
- Le matériel informatique et d'impression mis gratuitement à disposition au local BS
- La logistique des révisions académiques collectives.

Le montant statutaire est fixé à 500 FCFA par an.
Les reçus numériques officiels sont délivrés immédiatement après enregistrement par nos délégués d'amphithéâtre ou sur cette plateforme.`,
    isPinned: false,
    tags: ["Cotisation", "Trésorerie", "Solidarité"],
  },
  {
    id: "comm-004",
    title: "Mise en place des séances gratuites de révision intensive pour le niveau Licence 1",
    referenceNumber: "N° 012/2026/BS-FEUA/LOK",
    category: "Social",
    date: "2026-06-28",
    authorRole: "mix",
    authorName: "Aïcha S. HOUEDANOU (Affaires Académiques)",
    summary: "Des tuteurs étudiants seniors animeront des cours d'appui en Mathématiques Générales, Physiques appliquées et Algorithmique.",
    content: `Dans le cadre de son programme de solidarité estudiantine, le BS-Lokossa organise des séances de révision gratuites tous les samedis matin de 08h à 12h dans les salles B1 et B2.

Inscriptions gratuites auprès des délégués ou via l'onglet Calendrier de la plateforme.`,
    isPinned: false,
    tags: ["Tutorat", "Licence 1", "Entraide"],
  },
];

export const INITIAL_CLAIMS: Claim[] = [
  {
    id: "clm-101",
    studentName: "Marius SODJINOU",
    studentId: "2024-LOK-0492",
    filiere: "Informatique de Gestion - IUT",
    category: "Salles & Matériel",
    urgency: "Haute",
    title: "Coupure d'électricité permanente dans la salle informatique Salle B3",
    description: "Plus de la moitié des prises murales ne fonctionnent plus depuis 2 semaines. Impossible d'effectuer les TP d'algorithmique et de bases de données dans de bonnes conditions.",
    dateSubmitted: "2026-07-18",
    status: "Négociation Direction",
    adminResponse: "Le Bureau Syndical s'est entretenu avec le chef des services techniques. Un électricien de la direction est mandaté pour ce vendredi.",
    assignedRole: "amc",
    updatedAt: "2026-07-21",
  },
  {
    id: "clm-102",
    studentName: "Clarisse HOUESSOU",
    studentId: "2023-ENSET-0118",
    filiere: "Génie Électrique - ENSET",
    category: "Examens & Notes",
    urgency: "Moyenne",
    title: "Omission de la note de TP de Thermodynamique (L2)",
    description: "Toute la vigne Licence 2 de Génie Électrique constate un 'ZERO' par défaut sur le relevé provisoire de TP de Thermodynamique alors que le devoir a été remis le 12 juin.",
    dateSubmitted: "2026-07-16",
    status: "En cours d'étude",
    adminResponse: "Courrier officiel transmis à l'enseignant responsable avec copie au Chef de Département.",
    assignedRole: "mix",
    updatedAt: "2026-07-19",
  },
  {
    id: "clm-103",
    studentName: "Désiré KPONOU",
    studentId: "2025-LOK-1102",
    filiere: "Maintenance Industrielle - IUT",
    category: "Restauration & Logement",
    urgency: "Critique",
    title: "Rupture de stock récurrente au restaurant universitaire du campus",
    description: "À partir de 12h45, le guichet du RU annonce qu'il n'y a plus de plats disponibles alors que des centaines d'étudiants font la queue.",
    dateSubmitted: "2026-07-14",
    status: "Résolu",
    adminResponse: "Négociation réussie avec le COUS (Centre des Œuvres Universitaires): réajustement de +200 repas par jour à compter du 18 Juillet.",
    assignedRole: "amc",
    updatedAt: "2026-07-18",
  },
  {
    id: "clm-104",
    studentName: "Anicet ADJANOHOUN",
    studentId: "2024-ENSET-088',",
    filiere: "Génie Mécanique - ENSET",
    category: "Transport",
    urgency: "Moyenne",
    title: "Horaire du bus universitaire du soir (Lokossa Centre -> Campus)",
    description: "Le bus de 19h00 part souvent avec du retard, ce qui compromet la sécurité des étudiants résidant hors campus.",
    dateSubmitted: "2026-07-10",
    status: "Soumis",
    assignedRole: "amc",
    updatedAt: "2026-07-10",
  },
];

export const INITIAL_COTISATIONS: CotisationRecord[] = [
  {
    id: "cot-001",
    studentName: "Marius SODJINOU",
    matricule: "2024-LOK-0492",
    filiere: "Informatique de Gestion",
    niveau: "Licence 2",
    amount: 500,
    datePaid: "2026-07-19",
    receivedBy: "Gérard A. DOSSOU (TG)",
    receiptNumber: "REC-2026-0841",
    status: "Validé",
  },
  {
    id: "cot-002",
    studentName: "Bénédicte KPOMAHOU",
    matricule: "2023-ENSET-0210",
    filiere: "Génie Électrique",
    niveau: "Licence 3",
    amount: 1000,
    datePaid: "2026-07-18",
    receivedBy: "Gérard A. DOSSOU (TG)",
    receiptNumber: "REC-2026-0842",
    status: "Validé",
  },
  {
    id: "cot-003",
    studentName: "Koffi T. ZANNOU",
    matricule: "2025-LOK-0014",
    filiere: "Génie Civil",
    niveau: "Licence 1",
    amount: 500,
    datePaid: "2026-07-17",
    receivedBy: "Délégué Amphi A",
    receiptNumber: "REC-2026-0843",
    status: "Validé",
  },
  {
    id: "cot-004",
    studentName: "Sylvie TOSSOU",
    matricule: "2024-ENSET-0551",
    filiere: "Génie Chimique",
    niveau: "Licence 2",
    amount: 500,
    datePaid: "2026-07-15",
    receivedBy: "Gérard A. DOSSOU (TG)",
    receiptNumber: "REC-2026-0844",
    status: "Validé",
  },
];

export const INITIAL_FINANCIAL_SUMMARY: FinancialSummary = {
  totalCollected: 485000,
  totalSpent: 312500,
  balance: 172500,
  contributorCount: 970,
  expensesByCategory: [
    { category: "Social & Aides d'urgence", amount: 110000 },
    { category: "Impression & Fournitures local BS", amount: 65000 },
    { category: "Logistique Assemblées Générales", amount: 82500 },
    { category: "Support Révisions & Polycope", amount: 55000 },
  ],
};

export const INITIAL_EVENTS: UnionEvent[] = [
  {
    id: "evt-01",
    title: "Assemblée Générale d'Information & Négociation",
    type: "Assemblée Générale",
    date: "2026-07-28",
    time: "10h00 - 13h00",
    location: "Amphithéâtre 500 - Campus de Lokossa",
    description: "Évaluation des retombées de la rencontre avec le Rectorat et vote des actions d'accompagnement académique.",
    organizerRole: "ceo",
    registeredCount: 342,
    status: "À venir",
  },
  {
    id: "evt-02",
    title: "Marathon de Révision Intensive - Mathématiques & Physiques L1",
    type: "Séance de Révision",
    date: "2026-07-25",
    time: "08h30 - 12h30",
    location: "Salles Pédagogiques B1 & B2",
    description: "Résolution des anciens sujets d'examens corrigés par les majors de promo de Licence 3.",
    organizerRole: "mix",
    maxParticipants: 120,
    registeredCount: 98,
    status: "À venir",
  },
  {
    id: "evt-03",
    title: "Journée d'Orientation & d'Accueil des Nouveaux Bacheliers",
    type: "Journée Culturelle",
    date: "2026-08-05",
    time: "09h00 - 16h00",
    location: "Esplanade Centrale de Lokossa",
    description: "Présentation des filières ENSET et IUT, stand de guidage logement et ateliers d'intégration.",
    organizerRole: "mast",
    registeredCount: 180,
    status: "À venir",
  },
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-1",
    title: "Statuts & Règlement Intérieur du BS-FEUA Lokossa",
    category: "Statuts & Règlements",
    fileSize: "1.4 MB",
    dateUploaded: "2026-01-10",
    downloadCount: 1420,
    description: "Document fondamental régissant le fonctionnement du bureau syndical, les droits et devoirs des étudiants.",
  },
  {
    id: "doc-2",
    title: "Modèle officiel de Demande d'Exemption / Repêchage Académique",
    category: "Formulaires & Modèles",
    fileSize: "240 KB",
    dateUploaded: "2026-02-15",
    downloadCount: 890,
    description: "Canevas normalisé à adresser au Chef de Département pour réclamation de note ou d'absence justifiée.",
  },
  {
    id: "doc-3",
    title: "Rapport Financier Semestriel - Trésorerie Générale (Janvier-Juin 2026)",
    category: "Rapports d'Activités",
    fileSize: "850 KB",
    dateUploaded: "2026-07-02",
    downloadCount: 430,
    description: "Bilan financier détaillé certifié par le Trésorier Général et le Comité de Contrôle.",
  },
  {
    id: "doc-4",
    title: "Guide de l'Étudiant sur le Campus de Lokossa (Édition 2025-2026)",
    category: "Chartes",
    fileSize: "3.2 MB",
    dateUploaded: "2025-10-01",
    downloadCount: 2150,
    description: "Annuaire des services universitaires, carte du campus, adresses des résidences et contacts d'urgence.",
  },
];

export const CAMPUS_STATS = {
  totalStudents: 3450,
  iutStudents: 1980,
  ensetStudents: 1470,
  activeClaims: 4,
  resolvedClaimsThisYear: 89,
  cotisationRate: "72%",
};

export const INITIAL_REGISTRATIONS: RegistrationRecord[] = [
  {
    id: "reg-001",
    category: "membre_feua",
    fullName: "Marius SODJINOU",
    email: "marius.sodjinou@student.feua.bj",
    phone: "+229 97 12 34 56",
    matricule: "2024-LOK-0492",
    entite: "IUT Lokossa",
    filiere: "Informatique de Gestion",
    niveau: "Licence 2",
    photoUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80",
    status: "Validé",
    dateRegistered: "2026-07-10",
    cotisationStatus: "À jour (500 FCFA)",
  },
  {
    id: "reg-002",
    category: "etudiant_landa",
    fullName: "Pascaline ADANHO",
    email: "pascaline.adanho@gmail.com",
    phone: "+229 62 88 44 11",
    matricule: "2025-LOK-9912",
    entite: "ENSET Lokossa",
    filiere: "Génie Chimique",
    niveau: "Licence 1",
    status: "Validé",
    dateRegistered: "2026-07-18",
    cotisationStatus: "Non payé",
  },
  {
    id: "reg-003",
    category: "membre_bureau",
    fullName: "Aïcha S. HOUEDANOU",
    email: "academique.bslokossa@feua.bj",
    phone: "+229 61 22 45 67",
    matricule: "2023-IUT-0081",
    entite: "IUT Lokossa",
    filiere: "Informatique de Gestion",
    niveau: "Licence 2",
    bureauRole: "mix",
    invitationCode: "FEUA-BS-2026-MIX",
    status: "Validé",
    dateRegistered: "2026-07-01",
    cotisationStatus: "À jour (500 FCFA)",
  },
];

