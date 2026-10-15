-- Route application data access through the authenticated Next.js API.
-- The browser only needs authenticated SELECT for message/notification Realtime.
BEGIN;

REVOKE ALL PRIVILEGES ON TABLE
  public.members,
  public.documents,
  public.document_downloads,
  public.cash_registers,
  public.cash_transactions,
  public.messages,
  public.message_recipients,
  public.uniform_orders,
  public.audit_logs,
  public.announcements,
  public.notifications,
  public.invitation_codes,
  public.annual_archives,
  public.indiscipline_records,
  public.push_subscriptions,
  public.rate_limit_buckets
FROM PUBLIC, anon, authenticated;

GRANT SELECT ON TABLE public.messages, public.notifications TO authenticated;

COMMIT;
