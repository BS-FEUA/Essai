-- ============ ENUMS ============

CREATE TYPE access_level AS ENUM (
  'CEO', 'MAST_IN', 'MAST', 'MASTER', 'MIX', 'MIN', 'AMC', 'IGN'
);

CREATE TYPE member_status AS ENUM (
  'ACTIVE', 'SUSPENDED', 'ARCHIVED', 'PENDING_VALIDATION', 'IGNORANT'
);

CREATE TYPE document_type AS ENUM (
  'CARTE_ETUDIANT', 'FICHE_PRE_INSCRIPTION', 'BULLETIN', 'CERTIFICAT', 'AUTRE'
);

CREATE TYPE cash_register_type AS ENUM (
  'PRINCIPALE', 'UNIFORMES', 'SERVICES_NUMERIQUES', 'EVENEMENTS'
);

CREATE TYPE transaction_type AS ENUM (
  'DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'TRANSFER', 'REFUND'
);

CREATE TYPE transaction_status AS ENUM (
  'PENDING', 'COMPLETED', 'FAILED', 'CANCELLED'
);

CREATE TYPE message_scope AS ENUM (
  'PLENIARY', 'PRIVATE'
);

CREATE TYPE uniform_order_status AS ENUM (
  'EN_ATTENTE', 'VAL1', 'VAL2', 'LIVRE', 'ANNULE'
);

CREATE TYPE audit_action AS ENUM (
  'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'LOGIN_FAILED',
  'ROLE_CHANGE', 'STATUS_CHANGE', 'PAYMENT', 'WITHDRAWAL',
  'DOCUMENT_UPLOAD', 'DOCUMENT_DOWNLOAD', 'MESSAGE_SEND', 'ARCHIVE',
  'EXPORT', 'SYSTEM', 'UNIFORM_ORDER'
);

CREATE TYPE notification_channel AS ENUM (
  'IN_APP', 'EMAIL', 'WHATSAPP', 'PUSH'
);

CREATE TYPE notification_status AS ENUM (
  'UNREAD', 'READ'
);

-- ============ MODELS ============

CREATE TABLE members (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  matricule TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  access_level access_level DEFAULT 'MIN',
  status member_status DEFAULT 'PENDING_VALIDATION',
  institution TEXT,
  filiere TEXT,
  niveau TEXT,
  date_of_birth TIMESTAMPTZ,
  photo_url TEXT,
  address TEXT,
  city TEXT,
  country TEXT DEFAULT 'Benin',
  fiche_soumise BOOLEAN DEFAULT false,
  carte_etudiant BOOLEAN DEFAULT false,
  last_login_at TIMESTAMPTZ,
  invited_by UUID REFERENCES members(id),
  validated_by UUID REFERENCES members(id),
  validated_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for members
CREATE INDEX idx_members_matricule ON members(matricule);
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_access_level ON members(access_level);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_institution ON members(institution);


CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  type document_type DEFAULT 'AUTRE',
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT NOT NULL,
  file_url TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  download_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT false,
  annee_scolaire TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_documents_member_id ON documents(member_id);
CREATE INDEX idx_documents_type ON documents(type);


CREATE TABLE document_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  member_id UUID REFERENCES members(id),
  ip_address TEXT,
  is_paid BOOLEAN DEFAULT false,
  amount INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_document_downloads_document_id ON document_downloads(document_id);
CREATE INDEX idx_document_downloads_member_id ON document_downloads(member_id);


CREATE TABLE cash_registers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type cash_register_type DEFAULT 'PRINCIPALE',
  description TEXT,
  balance INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cash_registers_type ON cash_registers(type);


CREATE TABLE cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  register_id UUID NOT NULL REFERENCES cash_registers(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES members(id),
  type transaction_type NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  reference TEXT,
  status transaction_status DEFAULT 'PENDING',
  payment_method TEXT,
  validated_by UUID REFERENCES members(id),
  validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cash_transactions_register_id ON cash_transactions(register_id);
CREATE INDEX idx_cash_transactions_member_id ON cash_transactions(member_id);
CREATE INDEX idx_cash_transactions_type ON cash_transactions(type);
CREATE INDEX idx_cash_transactions_status ON cash_transactions(status);


CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope message_scope DEFAULT 'PLENIARY',
  content TEXT NOT NULL,
  sender_id UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_scope ON messages(scope);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);


CREATE TABLE message_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMPTZ,
  UNIQUE(message_id, recipient_id)
);

CREATE INDEX idx_message_recipients_recipient_id ON message_recipients(recipient_id);


CREATE TABLE uniform_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID REFERENCES members(id),
  cycle INTEGER DEFAULT 1,
  taille TEXT,
  quantity INTEGER DEFAULT 1,
  status uniform_order_status DEFAULT 'EN_ATTENTE',
  total_amount INTEGER DEFAULT 0,
  payment_method TEXT,
  payment_ref TEXT,
  notes TEXT,
  validated1_by UUID REFERENCES members(id),
  validated1_at TIMESTAMPTZ,
  validated2_by UUID REFERENCES members(id),
  validated2_at TIMESTAMPTZ,
  livred_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_uniform_orders_member_id ON uniform_orders(member_id);
CREATE INDEX idx_uniform_orders_status ON uniform_orders(status);


CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action audit_action NOT NULL,
  actor_id UUID REFERENCES members(id),
  entity_type TEXT,
  entity_id TEXT,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);


CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_urgent BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_announcements_is_active ON announcements(is_active);


CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  channel notification_channel DEFAULT 'IN_APP',
  status notification_status DEFAULT 'UNREAD',
  link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_member_id ON notifications(member_id);
CREATE INDEX idx_notifications_status ON notifications(status);


CREATE TABLE invitation_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  invited_by UUID NOT NULL REFERENCES members(id),
  used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_invitation_codes_code ON invitation_codes(code);


CREATE TABLE annual_archives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  annee_scolaire TEXT UNIQUE NOT NULL,
  member_count INTEGER DEFAULT 0,
  archive_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


CREATE TABLE indiscipline_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES members(id),
  reason TEXT NOT NULL,
  recorded_by UUID NOT NULL REFERENCES members(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_indiscipline_records_member_id ON indiscipline_records(member_id);
