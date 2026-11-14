-- Cache auth.uid() once per statement in policies without changing access rules.
BEGIN;

DROP POLICY IF EXISTS "Documents viewable if public or owned" ON public.documents;
CREATE POLICY "Documents viewable if public or owned"
ON public.documents FOR SELECT TO authenticated
USING (is_public = true OR member_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members can insert their own documents" ON public.documents;
CREATE POLICY "Members can insert their own documents"
ON public.documents FOR INSERT TO authenticated
WITH CHECK (member_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their own messages or plenary" ON public.messages;
CREATE POLICY "Users can view their own messages or plenary"
ON public.messages FOR SELECT TO authenticated
USING (
  scope = 'PLENIARY'
  OR sender_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.message_recipients
    WHERE message_id = messages.id AND recipient_id = (SELECT auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view their own message receipts" ON public.message_recipients;
CREATE POLICY "Users can view their own message receipts"
ON public.message_recipients FOR SELECT TO authenticated
USING (recipient_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Members view their own or all if authorized" ON public.cash_transactions;
CREATE POLICY "Members view their own or all if authorized"
ON public.cash_transactions FOR SELECT TO authenticated
USING (
  member_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.members
    WHERE id = (SELECT auth.uid())
      AND access_level IN ('CEO', 'MAST_IN', 'MAST', 'MASTER')
  )
);

DROP POLICY IF EXISTS "Members view their own orders" ON public.uniform_orders;
CREATE POLICY "Members view their own orders"
ON public.uniform_orders FOR SELECT TO authenticated
USING (
  member_id = (SELECT auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.members
    WHERE id = (SELECT auth.uid())
      AND access_level IN ('CEO', 'MAST_IN', 'MAST', 'MASTER')
  )
);

DROP POLICY IF EXISTS "Members can view their own notifications" ON public.notifications;
CREATE POLICY "Members can view their own notifications"
ON public.notifications FOR SELECT TO authenticated
USING (member_id = (SELECT auth.uid()));

COMMIT;
