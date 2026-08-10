/**
 * Script de seed pour peupler Supabase avec des données de démonstration.
 * Exécuter avec : npx tsx supabase/seed.ts
 */

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY requises dans .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ============ COMPTES DÉMO ============
const DEMO_MEMBERS = [
  {
    email: 'ceo@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Comlan',
    lastName: 'AGOSSA',
    matricule: 'FEUA-CEO-001',
    accessLevel: 'CEO',
    status: 'ACTIVE',
    phone: '+229 97 42 18 90',
    institution: 'ENSET Lokossa',
    filiere: 'Génie Électrique & Informatique',
    niveau: 'Master 2',
  },
  {
    email: 'mastin@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Victoire',
    lastName: 'KPADONOU',
    matricule: 'FEUA-MASTIN-001',
    accessLevel: 'MAST_IN',
    status: 'ACTIVE',
    phone: '+229 96 11 09 84',
    institution: 'IUT Lokossa',
    filiere: 'Génie Civil & Fonderie',
    niveau: 'Licence 3',
  },
  {
    email: 'mast@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Romaric',
    lastName: 'SOSSOU',
    matricule: 'FEUA-MAST-001',
    accessLevel: 'MAST',
    status: 'ACTIVE',
    phone: '+229 95 88 23 10',
    institution: 'ENSET Lokossa',
    filiere: 'Génie Mécanique & Productique',
    niveau: 'Licence 3',
  },
  {
    email: 'master@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Gérard',
    lastName: 'DOSSOU',
    matricule: 'FEUA-MASTER-001',
    accessLevel: 'MASTER',
    status: 'ACTIVE',
    phone: '+229 94 33 81 12',
    institution: 'ENSET Lokossa',
    filiere: 'Maintenance Industrielle',
    niveau: 'Master 1',
  },
  {
    email: 'mix@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Aïcha',
    lastName: 'HOUEDANOU',
    matricule: 'FEUA-MIX-001',
    accessLevel: 'MIX',
    status: 'ACTIVE',
    phone: '+229 61 22 45 67',
    institution: 'IUT Lokossa',
    filiere: 'Informatique de Gestion',
    niveau: 'Licence 2',
  },
  {
    email: 'min@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Sèna',
    lastName: 'HOUNKPATIN',
    matricule: 'FEUA-MIN-001',
    accessLevel: 'MIN',
    status: 'ACTIVE',
    phone: '+229 97 00 14 55',
    institution: 'IUT Lokossa',
    filiere: 'Génie Chimique',
    niveau: 'Licence 3',
  },
  {
    email: 'amc@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Marius',
    lastName: 'SODJINOU',
    matricule: 'FEUA-AMC-001',
    accessLevel: 'AMC',
    status: 'ACTIVE',
    phone: '+229 97 12 34 56',
    institution: 'IUT Lokossa',
    filiere: 'Informatique de Gestion',
    niveau: 'Licence 2',
  },
  {
    email: 'ign@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Pascaline',
    lastName: 'ADANHO',
    matricule: 'FEUA-IGN-001',
    accessLevel: 'IGN',
    status: 'ACTIVE',
    phone: '+229 62 88 44 11',
    institution: 'ENSET Lokossa',
    filiere: 'Génie Chimique',
    niveau: 'Licence 1',
  },
  {
    email: 'pending@bslokossa.bj',
    password: 'demo1234',
    firstName: 'Anicet',
    lastName: 'ADJANOHOUN',
    matricule: 'FEUA-PENDING-001',
    accessLevel: 'MIN',
    status: 'PENDING_VALIDATION',
    phone: '+229 95 77 42 21',
    institution: 'ENSET Lokossa',
    filiere: 'Génie Mécanique',
    niveau: 'Licence 1',
  },
];

async function seedMembers() {
  console.log('\n📦 Création des membres démo...\n');
  const createdIds: Record<string, string> = {};

  for (const m of DEMO_MEMBERS) {
    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: m.email,
      password: m.password,
      email_confirm: true,
      user_metadata: {
        firstName: m.firstName,
        lastName: m.lastName,
        matricule: m.matricule,
      },
    });

    if (authError) {
      if (authError.message.includes('already been registered')) {
        console.log(`⚠️  ${m.email} déjà existant — skip`);
        // Try to get the user by email
        const { data: existing } = await supabase.auth.admin.listUsers();
        const existingUser = existing?.users?.find(u => u.email === m.email);
        if (existingUser) createdIds[m.email] = existingUser.id;
        continue;
      }
      console.error(`❌ Erreur Auth pour ${m.email}:`, authError.message);
      continue;
    }

    const userId = authData.user.id;
    createdIds[m.email] = userId;

    // 2. Upsert member profile
    const { error: memberError } = await supabase.from('members').upsert({
      id: userId,
      email: m.email,
      matricule: m.matricule,
      first_name: m.firstName,
      last_name: m.lastName,
      phone: m.phone,
      institution: m.institution,
      filiere: m.filiere,
      niveau: m.niveau,
      access_level: m.accessLevel,
      status: m.status,
      country: 'Benin',
    });

    if (memberError) {
      console.error(`❌ Erreur membre pour ${m.email}:`, memberError.message);
    } else {
      console.log(`✅ ${m.accessLevel.padEnd(8)} | ${m.firstName} ${m.lastName} — ${m.email}`);
    }
  }
  return createdIds;
}

async function seedCashRegisters(ceoId: string) {
  console.log('\n💰 Création des caisses...\n');

  const registers = [
    { name: 'Caisse Principale', type: 'PRINCIPALE', description: 'Caisse principale du Bureau Syndical', balance: 172500 },
    { name: 'Caisse Uniformes', type: 'UNIFORMES', description: 'Gestion des paiements pour commandes d\'uniformes', balance: 45000 },
    { name: 'Services Numériques', type: 'SERVICES_NUMERIQUES', description: 'Frais de gestion de la plateforme et services numériques', balance: 28000 },
    { name: 'Événements & Mobilisations', type: 'EVENEMENTS', description: 'Budget logistique des AG et événements syndicaux', balance: 15000 },
  ];

  for (const r of registers) {
    const { error } = await supabase.from('cash_registers').insert({
      ...r,
      created_by: ceoId,
      is_active: true,
    });
    if (error) {
      console.error(`❌ Erreur caisse ${r.name}:`, error.message);
    } else {
      console.log(`✅ Caisse: ${r.name} (${r.balance.toLocaleString()} FCFA)`);
    }
  }
}

async function seedAnnouncements(ceoId: string) {
  console.log('\n📣 Création des annonces...\n');

  const announcements = [
    {
      title: 'Bienvenue sur la nouvelle plateforme BS-Lokossa !',
      content: 'La plateforme numérique du Bureau Syndical de Lokossa est désormais opérationnelle. Connectez-vous pour accéder à vos documents, suivre vos cotisations et communiquer avec le bureau.',
      is_urgent: false,
      is_active: true,
    },
    {
      title: '🔴 Assemblée Générale — Lundi 18 Août 2026 à 10h00',
      content: 'Une Assemblée Générale ordinaire est convoquée pour ce lundi à l\'Amphithéâtre 500. Ordre du jour : bilan financier S1, vote du budget S2, point sur les revendications en cours auprès de la Direction.',
      is_urgent: true,
      is_active: true,
    },
    {
      title: 'Campagne cotisation syndicale 2025-2026',
      content: 'Rappel : la cotisation annuelle de 500 FCFA est à verser auprès de votre délégué d\'amphi ou directement sur la plateforme. Les membres à jour bénéficient de l\'assistance sociale complète du BS.',
      is_urgent: false,
      is_active: true,
    },
  ];

  for (const a of announcements) {
    const { error } = await supabase.from('announcements').insert({ ...a, created_by: ceoId });
    if (error) {
      console.error(`❌ Erreur annonce:`, error.message);
    } else {
      console.log(`✅ Annonce: ${a.title.slice(0, 50)}...`);
    }
  }
}

async function main() {
  console.log('🚀 Démarrage du seed BS-Lokossa Supabase...');
  console.log(`📡 URL: ${supabaseUrl}\n`);

  const createdIds = await seedMembers();

  const ceoId = createdIds['ceo@bslokossa.bj'];
  if (!ceoId) {
    console.error('❌ CEO introuvable — arrêt du seed');
    process.exit(1);
  }

  await seedCashRegisters(ceoId);
  await seedAnnouncements(ceoId);

  console.log('\n✅ Seed terminé avec succès !\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  Comptes de démonstration (mot de passe: demo1234)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  for (const m of DEMO_MEMBERS) {
    console.log(`  ${m.accessLevel.padEnd(8)} | ${m.email}`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main().catch(err => {
  console.error('❌ Erreur seed:', err);
  process.exit(1);
});
