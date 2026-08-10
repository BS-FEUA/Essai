-- ============ RLS POLICIES ============

-- Enable RLS on all tables
ALTER TABLE members ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_registers ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_recipients ENABLE ROW LEVEL SECURITY;
ALTER TABLE uniform_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitation_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_archives ENABLE ROW LEVEL SECURITY;
ALTER TABLE indiscipline_records ENABLE ROW LEVEL SECURITY;

-- 1. members
-- All authenticated users can view members
CREATE POLICY "Members are viewable by all authenticated users"
ON members FOR SELECT
TO authenticated
USING (true);

-- Members can update their own profile
CREATE POLICY "Members can update their own profile"
ON members FOR UPDATE
TO authenticated
USING (auth.uid() = id);

-- 2. documents
-- Documents are viewable if they are public or owned by the member
CREATE POLICY "Documents viewable if public or owned"
ON documents FOR SELECT
TO authenticated
USING (is_public = true OR member_id = auth.uid());

-- Members can upload their own documents
CREATE POLICY "Members can insert their own documents"
ON documents FOR INSERT
TO authenticated
WITH CHECK (member_id = auth.uid());

-- 3. audit_logs
-- Append-only table: ANY authenticated user can insert (or system)
CREATE POLICY "Anyone can insert audit logs"
ON audit_logs FOR INSERT
TO authenticated
WITH CHECK (true);

-- Only CEO or MAST_IN can view all audit logs
-- (Assuming we will check this in the frontend/API, but we can allow SELECT for everyone and let API filter, or restrict here)
CREATE POLICY "CEO and MAST_IN can view audit logs"
ON audit_logs FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND access_level IN ('CEO', 'MAST_IN')
  )
);

-- UPDATE and DELETE are blocked by triggers anyway, but we can also add RLS for safety
CREATE POLICY "NOBODY can update audit logs"
ON audit_logs FOR UPDATE
TO authenticated
USING (false);

CREATE POLICY "NOBODY can delete audit logs"
ON audit_logs FOR DELETE
TO authenticated
USING (false);

-- 4. messages
CREATE POLICY "Users can view their own messages or plenary"
ON messages FOR SELECT
TO authenticated
USING (
  scope = 'PLENIARY'
  OR sender_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM message_recipients
    WHERE message_id = messages.id AND recipient_id = auth.uid()
  )
);

CREATE POLICY "Users can insert messages"
ON messages FOR INSERT
TO authenticated
WITH CHECK (sender_id = auth.uid());

-- 5. message_recipients
CREATE POLICY "Users can view their own message receipts"
ON message_recipients FOR SELECT
TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own message receipts"
ON message_recipients FOR UPDATE
TO authenticated
USING (recipient_id = auth.uid());

CREATE POLICY "Sender can insert message recipients"
ON message_recipients FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages
    WHERE id = message_id AND sender_id = auth.uid()
  )
);

-- 6. cash_transactions
-- CEO, MAST_IN, MAST, MASTER can view all. Others view only their own.
CREATE POLICY "Members view their own or all if authorized"
ON cash_transactions FOR SELECT
TO authenticated
USING (
  member_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND access_level IN ('CEO', 'MAST_IN', 'MAST', 'MASTER')
  )
);

-- 7. uniform_orders
-- Members view their own
CREATE POLICY "Members view their own orders"
ON uniform_orders FOR SELECT
TO authenticated
USING (
  member_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM members
    WHERE id = auth.uid() AND access_level IN ('CEO', 'MAST_IN', 'MAST', 'MASTER')
  )
);
