import { cert, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { supabaseAdmin } from '@/lib/db';

function getFirebaseAdminApp() {
  if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !process.env.FIREBASE_ADMIN_PRIVATE_KEY) {
    return null;
  }

  if (getApps().length) return getApps()[0];
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
  });
}

export async function sendWebPushToMembers(
  memberIds: string[],
  notification: { title: string; body: string; link?: string | null },
) {
  try {
    const app = getFirebaseAdminApp();
    if (!app || memberIds.length === 0) return;

    const { data: subscriptions, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('id, token')
      .in('member_id', memberIds);
    if (error) {
      console.error('Push subscription lookup failed:', error);
      return;
    }
    if (!subscriptions?.length) return;

    const messaging = getMessaging(app);
    for (let offset = 0; offset < subscriptions.length; offset += 500) {
      const batch = subscriptions.slice(offset, offset + 500);
      const result = await messaging.sendEachForMulticast({
        tokens: batch.map((subscription) => subscription.token),
        notification: { title: notification.title, body: notification.body },
        data: { link: notification.link || '/notifications' },
        webpush: { fcmOptions: { link: notification.link || '/notifications' } },
      });

      const invalidTokens = result.responses.flatMap((response, index) => {
        const code = response.error?.code;
        return code === 'messaging/registration-token-not-registered' || code === 'messaging/invalid-registration-token'
          ? [batch[index].id]
          : [];
      });
      if (invalidTokens.length) {
        const { error: cleanupError } = await supabaseAdmin.from('push_subscriptions').delete().in('id', invalidTokens);
        if (cleanupError) console.error('Push token cleanup failed:', cleanupError);
      }
    }
  } catch (error) {
    // Push delivery is best-effort and must not break in-app messaging.
    console.error('Web push delivery failed:', error);
  }
}
