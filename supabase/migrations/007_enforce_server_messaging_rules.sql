-- Messaging writes must go through the authenticated API routes, which enforce
-- the application's hierarchy rules and create corresponding notifications.
-- Keep authenticated SELECT on messages for the existing Realtime subscription.
BEGIN;

REVOKE INSERT, UPDATE, DELETE ON TABLE public.messages FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can insert messages" ON public.messages;

-- The API marks receipts as read with the service role. Clients only need to
-- read their own receipts so the private-message SELECT policy keeps working.
REVOKE INSERT, UPDATE, DELETE ON TABLE public.message_recipients FROM anon, authenticated;
DROP POLICY IF EXISTS "Users can update their own message receipts" ON public.message_recipients;
DROP POLICY IF EXISTS "Sender can insert message recipients" ON public.message_recipients;

COMMIT;
