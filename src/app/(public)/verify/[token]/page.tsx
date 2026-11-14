import { BadgeVerificationView } from '@/components/views/BadgeVerificationView';

export default async function VerifyBadgePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <BadgeVerificationView token={token} />;
}
