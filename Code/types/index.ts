export type UserRole =
  | "ceo"      // Président du Bureau Syndical
  | "mast_in"  // Secrétaire Général (SE-G)
  | "mast"     // Secrétaire à l'Organisation (S-ORG)
  | "mix"      // Secrétaire aux Affaires Académiques & Culturelles
  | "min"      // Secrétaire à l'Information & Communication
  | "tg"       // Trésorier Général
  | "tga"      // Trésorier Général Adjoint
  | "amc";     // Chargé du Matériel & Affaires Sociales

export interface RoleInfo {
  code: UserRole;
  title: string;
  fullName: string;
  description: string;
  badgeColor: string;
}

export interface BureauMember {
  id: string;
  role: UserRole;
  name: string;
  filiere: string; // e.g. "Génie Electrique - ENSET", "Informatique - IUT"
  niveau: string;  // e.g. "Master 1", "Licence 3"
  photoUrl: string;
  phone: string;
  email: string;
  officeHours: string;
  bio: string;
}

export interface Communique {
  id: string;
  title: string;
  referenceNumber: string; // e.g. "N° 014/2026/BS-FEUA/LOK"
  category: "Urgent" | "Académique" | "Assemblé Générale" | "Social" | "Information";
  date: string;
  authorRole: UserRole;
  authorName: string;
  summary: string;
  content: string;
  isPinned?: boolean;
  pdfUrl?: string;
  tags: string[];
}

export type ClaimStatus = "Soumis" | "En cours d'étude" | "Négociation Direction" | "Résolu" | "Rejeté";

export interface Claim {
  id: string;
  studentName: string;
  studentId: string; // Matricule / N° Carte Étudiant
  filiere: string;
  category: "Examens & Notes" | "Salles & Matériel" | "Restauration & Logement" | "Transport" | "Autre";
  urgency: "Faible" | "Moyenne" | "Haute" | "Critique";
  title: string;
  description: string;
  dateSubmitted: string;
  status: ClaimStatus;
  adminResponse?: string;
  assignedRole?: UserRole;
  updatedAt: string;
}

export interface CotisationRecord {
  id: string;
  studentName: string;
  matricule: string;
  filiere: string;
  niveau: string;
  amount: number;
  datePaid: string;
  receivedBy: string;
  receiptNumber: string;
  status: "Validé" | "En attente";
}

export interface FinancialSummary {
  totalCollected: number;
  totalSpent: number;
  balance: number;
  contributorCount: number;
  expensesByCategory: { category: string; amount: number }[];
}

export interface UnionEvent {
  id: string;
  title: string;
  type: "Assemblée Générale" | "Conférence" | "Journée Culturelle" | "Séance de Révision" | "Sit-in Peaceful";
  date: string;
  time: string;
  location: string;
  description: string;
  organizerRole: UserRole;
  maxParticipants?: number;
  registeredCount: number;
  status: "À venir" | "En cours" | "Terminé";
}

export interface DocumentItem {
  id: string;
  title: string;
  category: "Statuts & Règlements" | "Rapports d'Activités" | "Formulaires & Modèles" | "Chartes";
  fileSize: string;
  dateUploaded: string;
  downloadCount: number;
  description: string;
}

export type UserCategory = "membre_feua" | "etudiant_landa" | "membre_bureau";

export interface RegistrationRecord {
  id: string;
  category: UserCategory;
  fullName: string;
  email: string;
  phone: string;
  matricule: string;
  entite: "IUT Lokossa" | "ENSET Lokossa" | "InstI Lokossa" | "Autre";
  filiere: string;
  niveau: string;
  photoUrl?: string;
  invitationCode?: string;
  bureauRole?: UserRole;
  status: "En attente" | "Validé" | "Rejeté";
  dateRegistered: string;
  cotisationStatus: "À jour (500 FCFA)" | "Non payé";
}
