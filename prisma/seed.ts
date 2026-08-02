import { PrismaClient, AccessLevel, MemberStatus } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

// Helper: hash password
async function hashPassword(password: string): Promise<string> {
  return hash(password, 12);
}

// Helper: create date string
function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log('🌱 Seeding BS-Lokossa database...');

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.messageRecipient.deleteMany();
  await prisma.message.deleteMany();
  await prisma.documentDownload.deleteMany();
  await prisma.document.deleteMany();
  await prisma.cashTransaction.deleteMany();
  await prisma.cashRegister.deleteMany();
  await prisma.uniformOrder.deleteMany();
  await prisma.indisciplineRecord.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.invitationCode.deleteMany();
  await prisma.annualArchive.deleteMany();
  await prisma.member.deleteMany();

  // ============ CREATE MEMBERS (8 access levels) ============
  const ceoPassword = await hashPassword('ceo2026');
  const mastInPassword = await hashPassword('mastin2026');
  const mastPassword = await hashPassword('mast2026');
  const masterPassword = await hashPassword('master2026');
  const mixPassword = await hashPassword('mix2026');
  const minPassword = await hashPassword('min2026');
  const amcPassword = await hashPassword('amc2026');
  const ignPassword = await hashPassword('ign2026');

  const ceo = await prisma.member.create({
    data: {
      matricule: 'FEUA-CEO-001',
      firstName: 'Ahoussou',
      lastName: 'Kodjo',
      email: 'ceo@feua.bj',
      phone: '+229 90 00 00 01',
      passwordHash: ceoPassword,
      accessLevel: AccessLevel.CEO,
      status: MemberStatus.ACTIVE,
      institution: 'Université de Lokossa',
      filiere: 'Droit',
      niveau: 'Licence 3',
      ficheSoumise: true,
      carteEtudiant: true,
      lastLoginAt: daysAgo(1),
    },
  });

  const mastIn = await prisma.member.create({
    data: {
      matricule: 'FEUA-MI-001',
      firstName: 'Dossou',
      lastName: 'Adjovi',
      email: 'mastin@feua.bj',
      phone: '+229 90 00 00 02',
      passwordHash: mastInPassword,
      accessLevel: AccessLevel.MAST_IN,
      status: MemberStatus.ACTIVE,
      institution: 'Université de Lokossa',
      filiere: 'Gestion',
      niveau: 'Master 1',
      ficheSoumise: true,
      carteEtudiant: true,
      lastLoginAt: daysAgo(2),
    },
  });

  const mast = await prisma.member.create({
    data: {
      matricule: 'FEUA-MA-001',
      firstName: 'Agossou',
      lastName: 'Komlan',
      email: 'mast@feua.bj',
      phone: '+229 90 00 00 03',
      passwordHash: mastPassword,
      accessLevel: AccessLevel.MAST,
      status: MemberStatus.ACTIVE,
      institution: 'Université de Lokossa',
      filiere: 'Sciences Politiques',
      niveau: 'Master 2',
      ficheSoumise: true,
      carteEtudiant: true,
      lastLoginAt: daysAgo(3),
    },
  });

  const master1 = await prisma.member.create({
    data: {
      matricule: 'FEUA-MS-001',
      firstName: 'Houéssou',
      lastName: 'Rachida',
      email: 'master@feua.bj',
      phone: '+229 90 00 00 04',
      passwordHash: masterPassword,
      accessLevel: AccessLevel.MASTER,
      status: MemberStatus.ACTIVE,
      institution: 'Université de Lokossa',
      filiere: 'Sociologie',
      niveau: 'Licence 3',
      ficheSoumise: true,
      carteEtudiant: true,
      lastLoginAt: daysAgo(4),
    },
  });

  const mixMember = await prisma.member.create({
    data: {
      matricule: 'FEUA-MX-001',
      firstName: 'Tossou',
      lastName: 'Eudes',
      email: 'mix@feua.bj',
      phone: '+229 90 00 00 05',
      passwordHash: mixPassword,
      accessLevel: AccessLevel.MIX,
      status: MemberStatus.ACTIVE,
      institution: 'Université d\'Abomey-Calavi',
      filiere: 'Économie',
      niveau: 'Licence 2',
      ficheSoumise: true,
      carteEtudiant: false,
      lastLoginAt: daysAgo(5),
    },
  });

  const minMember = await prisma.member.create({
    data: {
      matricule: 'FEUA-MN-001',
      firstName: 'Agbakpé',
      lastName: 'Sandrine',
      email: 'min@feua.bj',
      phone: '+229 90 00 00 06',
      passwordHash: minPassword,
      accessLevel: AccessLevel.MIN,
      status: MemberStatus.ACTIVE,
      institution: 'Université de Lokossa',
      filiere: 'Droit',
      niveau: 'Licence 1',
      ficheSoumise: false,
      carteEtudiant: false,
      lastLoginAt: daysAgo(6),
    },
  });

  const amcMember = await prisma.member.create({
    data: {
      matricule: 'FEUA-AC-001',
      firstName: 'Koffi',
      lastName: 'Sylvain',
      email: 'amc@feua.bj',
      phone: '+229 90 00 00 07',
      passwordHash: amcPassword,
      accessLevel: AccessLevel.AMC,
      status: MemberStatus.ARCHIVED,
      institution: 'Université de Lokossa',
      filiere: 'Gestion',
      niveau: 'Licence 3',
      ficheSoumise: true,
      carteEtudiant: true,
    },
  });

  const ignMember = await prisma.member.create({
    data: {
      matricule: 'FEUA-IG-001',
      firstName: 'Mensah',
      lastName: 'Brice',
      email: 'ign@feua.bj',
      phone: '+229 90 00 00 08',
      passwordHash: ignPassword,
      accessLevel: AccessLevel.IGN,
      status: MemberStatus.IGNORANT,
      institution: 'Université de Lokossa',
      filiere: 'Droit',
      niveau: 'Licence 2',
    },
  });

  // Additional active members
  const extraMembers = [];
  const names = [
    ['Yao', 'Marie', 'Droit', 'L1'], ['Kouassi', 'Patrick', 'Gestion', 'L2'],
    ['Akpé', 'Béatrice', 'Sociologie', 'L3'], ['Djossou', 'Gildas', 'Sciences Politiques', 'M1'],
    ['Hounkpatin', 'Aminata', 'Droit', 'L2'], ['Zannou', 'Hervé', 'Économie', 'L3'],
    ['Sossou', 'Clémence', 'Gestion', 'L1'], ['Dègui', 'Emmanuel', 'Droit', 'M2'],
    ['Vodounou', 'Fabiola', 'Sociologie', 'L2'], ['Aïssah', 'Moussa', 'Droit', 'L3'],
    ['Cossi', 'Régina', 'Gestion', 'M1'], ['Tchassou', 'David', 'Sciences Politiques', 'L1'],
  ];

  for (let i = 0; i < names.length; i++) {
    const [fn, ln, fil, niv] = names[i];
    const nivMap: Record<string, string> = { 'L1': 'Licence 1', 'L2': 'Licence 2', 'L3': 'Licence 3', 'M1': 'Master 1', 'M2': 'Master 2' };
    const pw = await hashPassword(`member${i + 1}2026`);
    const m = await prisma.member.create({
      data: {
        matricule: `FEUA-${String(i + 10).padStart(3, '0')}`,
        firstName: fn,
        lastName: ln,
        email: `${fn.toLowerCase()}.${ln.toLowerCase()}@feua.bj`,
        phone: `+229 90 00 ${String(10 + i).padStart(2, '0')} ${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
        passwordHash: pw,
        accessLevel: i < 2 ? AccessLevel.MIX : AccessLevel.MIN,
        status: MemberStatus.ACTIVE,
        institution: i % 3 === 0 ? "Université d'Abomey-Calavi" : 'Université de Lokossa',
        filiere: fil,
        niveau: nivMap[niv] || niv,
        ficheSoumise: Math.random() > 0.3,
        carteEtudiant: Math.random() > 0.5,
        lastLoginAt: daysAgo(Math.floor(Math.random() * 30)),
      },
    });
    extraMembers.push(m);
  }

  console.log(`✅ Created ${8 + extraMembers.length} members`);

  // ============ CASH REGISTERS ============
  const mainRegister = await prisma.cashRegister.create({
    data: { name: 'Caisse Principale', type: 'PRINCIPALE', balance: 525000, isActive: true, createdBy: ceo.id },
  });
  await prisma.cashRegister.create({
    data: { name: 'Caisse Uniformes', type: 'UNIFORMES', balance: 180000, isActive: true, createdBy: ceo.id },
  });
  await prisma.cashRegister.create({
    data: { name: 'Caisse Services Numériques', type: 'SERVICES_NUMERIQUES', balance: 35000, isActive: true, createdBy: mastIn.id },
  });

  console.log('✅ Created 3 cash registers');

  // ============ CASH TRANSACTIONS ============
  const transactions = [
    { memberId: mixMember.id, type: 'DEPOSIT' as const, amount: 5000, desc: 'Cotisation annuelle', method: 'MTN_MOMO', status: 'COMPLETED' as const },
    { memberId: minMember.id, type: 'DEPOSIT' as const, amount: 5000, desc: 'Cotisation annuelle', method: 'MOOV_MONEY', status: 'COMPLETED' as const },
    { memberId: extraMembers[0]?.id || ceo.id, type: 'DEPOSIT' as const, amount: 5000, desc: 'Cotisation annuelle', method: 'ESPECES', status: 'COMPLETED' as const },
    { memberId: extraMembers[1]?.id || ceo.id, type: 'DEPOSIT' as const, amount: 5000, desc: 'Cotisation annuelle', method: 'MTN_MOMO', status: 'COMPLETED' as const },
    { memberId: extraMembers[2]?.id || ceo.id, type: 'DEPOSIT' as const, amount: 5000, desc: 'Cotisation annuelle', method: 'CARTE', status: 'COMPLETED' as const },
    { memberId: mastIn.id, type: 'WITHDRAWAL' as const, amount: 25000, desc: 'Achat matériel bureau', method: 'ESPECES', status: 'COMPLETED' as const },
    { memberId: ceo.id, type: 'WITHDRAWAL' as const, amount: 15000, desc: 'Organisation événement', method: 'ESPECES', status: 'PENDING' as const },
    { memberId: extraMembers[3]?.id || ceo.id, type: 'PAYMENT' as const, amount: 15000, desc: 'Commande uniforme', method: 'MTN_MOMO', status: 'COMPLETED' as const },
  ];

  for (const t of transactions) {
    await prisma.cashTransaction.create({
      data: {
        registerId: mainRegister.id,
        memberId: t.memberId,
        type: t.type,
        amount: t.amount,
        description: t.desc,
        paymentMethod: t.method,
        status: t.status,
        validatedBy: mastIn.id,
        validatedAt: daysAgo(Math.floor(Math.random() * 10)),
      },
    });
  }

  console.log('✅ Created 8 cash transactions');

  // ============ ANNOUNCEMENTS ============
  await prisma.announcement.createMany({
    data: [
      { title: '📢 Assemblée Générale Extraordinaire', content: 'Tous les membres FEUA sont convoqués à l\'Assemblée Générale Extraordinaire prévue le samedi 15 novembre 2026 à 09h00 à l\'Amphithéâtre A de l\'Université de Lokossa. Présence obligatoire.', isUrgent: true, isActive: true, createdBy: ceo.id },
      { title: '📝 Rappel : Soumission des fiches', content: 'Nous rappelons à tous les membres n\'ayant pas encore soumis leur fiche pré-inscription de le faire avant le 30 octobre 2026. Les membres sans fiche seront bloqués.', isUrgent: true, isActive: true, createdBy: mastIn.id },
      { title: '🎓 Journée Portes Ouvertes FEUA', content: 'La FEUA organise une journée portes ouvertes le 20 octobre 2026 pour les nouveaux étudiants. Venez découvrir nos activités et rejoindre le bureau syndical de Lokossa.', isUrgent: false, isActive: true, createdBy: mast.id },
      { title: '💰 Bilan financier Q1 disponible', content: 'Le bilan financier du premier trimestre est maintenant consultable dans la section Caisses de l\'application. Merci de vérifier les montants.', isUrgent: false, isActive: true, createdBy: master1.id },
      { title: '👕 Distribution uniformes cycle 2', content: 'Les uniformes du cycle 2 sont prêts. Les membres ayant commandé peuvent passer au siège pour récupérer leur commande.', isUrgent: false, isActive: true, createdBy: mastIn.id },
    ],
  });

  console.log('✅ Created 5 announcements');

  // ============ MESSAGES (Plenary) ============
  const plenaryMsgs = [
    { senderId: ceo.id, content: 'Bienvenue à tous dans la messagerie FEUA ! N\'oubliez pas l\'AG de samedi.' },
    { senderId: mastIn.id, content: 'Bonjour à tous. Les invitations ont été envoyées par email. Vérifiez vos boîtes.' },
    { senderId: master1.id, content: 'Les membres de Licence 1 sont priés de soumettre leurs fiches avant vendredi.' },
    { senderId: mast.id, content: 'La réunion du bureau a confirmé la date de la distribution des uniformes.' },
    { senderId: mixMember.id, content: 'Merci pour l\'information. On sera présent samedi !' },
  ];

  const allMembers = [ceo, mastIn, mast, master1, mixMember, minMember, ...extraMembers];
  for (const msg of plenaryMsgs) {
    const message = await prisma.message.create({
      data: { scope: 'PLENIARY', content: msg.content, senderId: msg.senderId },
    });
    // Add recipients (all active members except sender)
    for (const member of allMembers) {
      if (member.id !== msg.senderId && member.status === 'ACTIVE') {
        await prisma.messageRecipient.create({
          data: { messageId: message.id, recipientId: member.id, isRead: Math.random() > 0.6 ? true : false },
        });
      }
    }
  }

  console.log('✅ Created plenary messages');

  // ============ UNIFORM ORDERS ============
  await prisma.uniformOrder.createMany({
    data: [
      { memberId: mixMember.id, cycle: 1, taille: 'M', quantity: 1, status: 'LIVRE', totalAmount: 15000, paymentMethod: 'MTN_MOMO', validated1By: master1.id, validated2By: mastIn.id, livredAt: daysAgo(5) },
      { memberId: minMember.id, cycle: 1, taille: 'L', quantity: 1, status: 'VAL2', totalAmount: 15000, paymentMethod: 'MOOV_MONEY', validated1By: master1.id, validated2By: mastIn.id },
      { memberId: extraMembers[0]?.id || ceo.id, cycle: 1, taille: 'S', quantity: 1, status: 'VAL1', totalAmount: 15000, validated1By: master1.id },
      { memberId: extraMembers[1]?.id || ceo.id, cycle: 1, taille: 'XL', quantity: 2, status: 'EN_ATTENTE', totalAmount: 30000 },
      { memberId: extraMembers[2]?.id || ceo.id, cycle: 2, taille: 'M', quantity: 1, status: 'EN_ATTENTE', totalAmount: 15000 },
    ],
  });

  console.log('✅ Created uniform orders');

  // ============ DOCUMENTS ============
  await prisma.document.createMany({
    data: [
      { title: 'Carte Étudiante - Kodjo Ahoussou', type: 'CARTE_ETUDIANT', fileName: 'carte_kodjo.pdf', fileSize: 245000, mimeType: 'application/pdf', fileUrl: '/documents/carte_kodjo.pdf', memberId: ceo.id, downloadCount: 0, isPublic: false, anneeScolaire: '2025-2026' },
      { title: 'Fiche Pré-inscription - Adjovi Dossou', type: 'FICHE_PRE_INSCRIPTION', fileName: 'fiche_adjovi.pdf', fileSize: 180000, mimeType: 'application/pdf', fileUrl: '/documents/fiche_adjovi.pdf', memberId: mastIn.id, downloadCount: 2, isPublic: false, anneeScolaire: '2025-2026' },
      { title: 'Bulletin - Komlan Agossou', type: 'BULLETIN', fileName: 'bulletin_komlan.pdf', fileSize: 520000, mimeType: 'application/pdf', fileUrl: '/documents/bulletin_komlan.pdf', memberId: mast.id, downloadCount: 1, isPublic: false, anneeScolaire: '2025-2026' },
    ],
  });

  console.log('✅ Created documents');

  // ============ AUDIT LOGS (Mémoire H) ============
  await prisma.auditLog.createMany({
    data: [
      { action: 'LOGIN', actorId: ceo.id, entityType: 'Member', entityId: ceo.id, details: 'Connexion réussie', createdAt: daysAgo(1) },
      { action: 'LOGIN', actorId: mastIn.id, entityType: 'Member', entityId: mastIn.id, details: 'Connexion réussie', createdAt: daysAgo(2) },
      { action: 'ROLE_CHANGE', actorId: ceo.id, entityType: 'Member', entityId: mixMember.id, details: 'Min → Mix', createdAt: daysAgo(10) },
      { action: 'PAYMENT', actorId: mixMember.id, entityType: 'CashTransaction', entityId: 'tx-001', details: 'Dépôt 5000 FCFA', createdAt: daysAgo(7) },
      { action: 'DOCUMENT_UPLOAD', actorId: ceo.id, entityType: 'Document', entityId: 'doc-001', details: 'Upload carte étudiante', createdAt: daysAgo(15) },
      { action: 'MESSAGE_SEND', actorId: mastIn.id, entityType: 'Message', entityId: 'msg-002', details: 'Message plénière', createdAt: daysAgo(3) },
      { action: 'SYSTEM', actorId: ceo.id, entityType: 'System', entityId: null, details: 'Initialisation application BS-Lokossa', createdAt: daysAgo(30) },
    ],
  });

  console.log('✅ Created audit logs');

  // ============ NOTIFICATIONS ============
  await prisma.notification.createMany({
    data: [
      { memberId: ceo.id, title: 'Nouveau membre inscrit', content: 'Sandrine Agbakpé a soumis sa fiche d\'inscription.', status: 'UNREAD', channel: 'IN_APP' },
      { memberId: minMember.id, title: 'Rappel fiche', content: 'Vous n\'avez pas encore soumis votre fiche pré-inscription.', status: 'UNREAD', channel: 'IN_APP' },
      { memberId: mixMember.id, title: 'Uniforme prêt', content: 'Votre uniforme du cycle 1 est prêt. Passez au siège pour le récupérer.', status: 'READ', channel: 'IN_APP' },
    ],
  });

  console.log('✅ Created notifications');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Demo accounts:');
  console.log('  CEO:       ceo@feua.bj / ceo2026');
  console.log('  Mast In:   mastin@feua.bj / mastin2026');
  console.log('  Mast:      mast@feua.bj / mast2026');
  console.log('  Master:    master@feua.bj / master2026');
  console.log('  Mix:       mix@feua.bj / mix2026');
  console.log('  Min:       min@feua.bj / min2026');
  console.log('  AMC:       amc@feua.bj / amc2026');
  console.log('  IGN:       ign@feua.bj / ign2026');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
