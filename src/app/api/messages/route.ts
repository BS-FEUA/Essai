import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canSendMessage } from '@/lib/auth';
import { sendWebPushToMembers } from '@/lib/firebase-admin';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'PLENIARY';
    if (scope !== 'PLENIARY' && scope !== 'PRIVATE') {
      return NextResponse.json({ error: 'Type de messagerie invalide' }, { status: 400 });
    }
    const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get('limit') || '30', 10) || 30));
    const recipientId = searchParams.get('recipientId');

    let query = supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:members!messages_sender_id_fkey(id, first_name, last_name, access_level, photo_url),
        recipients:message_recipients(*)
      `, { count: 'exact' })
      .eq('scope', scope);

    if (scope === 'PRIVATE') {
      if (recipientId === session.id) {
        return NextResponse.json({ error: 'Choisissez un autre membre comme destinataire' }, { status: 400 });
      }

      const conversationMembers = recipientId ? [session.id, recipientId] : [session.id];
      const { data: receiptRows, error: receiptError } = await supabaseAdmin
        .from('message_recipients')
        .select('message_id, recipient_id')
        .in('recipient_id', conversationMembers);
      if (receiptError) throw receiptError;

      const membersByMessage = new Map<string, Set<string>>();
      for (const receipt of receiptRows || []) {
        const members = membersByMessage.get(receipt.message_id) || new Set<string>();
        members.add(receipt.recipient_id);
        membersByMessage.set(receipt.message_id, members);
      }
      const privateMessageIds = [...membersByMessage.entries()]
        .filter(([, members]) => conversationMembers.every((id) => members.has(id)))
        .map(([id]) => id);

      if (privateMessageIds.length === 0) {
        return NextResponse.json({ messages: [], total: 0, page, limit });
      }
      query = query.in('id', privateMessageIds);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: messagesRaw, count, error } = await query;

    if (error) throw error;

    // Filter recipients to only the current user for the frontend and map names
    const messages = (messagesRaw || []).map(m => {
      const userReceipts = (m.recipients || []).filter((r: any) => r.recipient_id === session.id);
      return {
        ...m,
        senderId: m.sender_id,
        createdAt: m.created_at,
        sender: m.sender ? {
          id: Array.isArray(m.sender) ? m.sender[0].id : m.sender.id,
          firstName: Array.isArray(m.sender) ? m.sender[0].first_name : m.sender.first_name,
          lastName: Array.isArray(m.sender) ? m.sender[0].last_name : m.sender.last_name,
          accessLevel: Array.isArray(m.sender) ? m.sender[0].access_level : m.sender.access_level,
          photoUrl: Array.isArray(m.sender) ? m.sender[0].photo_url : m.sender.photo_url,
        } : null,
        recipients: userReceipts.map((r: any) => ({
          id: r.id,
          isRead: r.is_read,
          readAt: r.read_at,
        })),
        _count: {
          recipients: (m.recipients || []).length
        }
      };
    });

    // Mark as read
    const unreadIds = messages
      .map(m => m.recipients[0])
      .filter((r) => r && !r.isRead)
      .map(r => r.id);
    
    if (unreadIds.length > 0) {
      const { error: markReadError } = await supabaseAdmin
        .from('message_recipients')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('id', unreadIds);
      if (markReadError) throw markReadError;
    }

    return NextResponse.json({ messages: messages.reverse(), total: count || 0, page, limit });
  } catch (error) {
    console.error('Messages GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { content, scope = 'PLENIARY', recipientId } = body;

    if (typeof content !== 'string' || !content.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });
    if (content.length > 5000) return NextResponse.json({ error: 'Le message ne peut pas dépasser 5 000 caractères' }, { status: 400 });
    if (scope !== 'PLENIARY' && scope !== 'PRIVATE') {
      return NextResponse.json({ error: 'Type de messagerie invalide' }, { status: 400 });
    }

    const messageScope = scope;
    let privateRecipient: { id: string; first_name: string; last_name: string; access_level: string } | null = null;

    // Check messaging rules
    if (messageScope === 'PRIVATE') {
      if (typeof recipientId !== 'string' || !recipientId) {
        return NextResponse.json({ error: 'Un destinataire est requis pour un message privé' }, { status: 400 });
      }
      if (recipientId === session.id) {
        return NextResponse.json({ error: 'Vous ne pouvez pas vous envoyer un message privé' }, { status: 400 });
      }
      const { data: recipient, error: recipientError } = await supabaseAdmin
        .from('members')
        .select('id, first_name, last_name, access_level, status')
        .eq('id', recipientId)
        .single();
      if (recipientError && recipientError.code !== 'PGRST116') throw recipientError;
      if (!recipient || recipient.status !== 'ACTIVE') return NextResponse.json({ error: 'Destinataire non trouvé ou inactif' }, { status: 404 });
      privateRecipient = recipient;
      if (!canSendMessage(session.accessLevel, recipient.access_level)) {
        return NextResponse.json({ error: 'Règles hiérarchiques : vous ne pouvez pas envoyer de message à ce niveau' }, { status: 403 });
      }
    }

    const { data: message, error: messageError } = await supabaseAdmin.from('messages').insert({
      content: content.trim(), 
      scope: messageScope, 
      sender_id: session.id 
    }).select().single();

    if (messageError) throw messageError;

    // Add recipients and remove the message if delivery records cannot be saved.
    let notificationRecipients: string[] = [];
    if (messageScope === 'PLENIARY') {
      const { data: activeMembers, error: activeMembersError } = await supabaseAdmin
        .from('members').select('id').eq('status', 'ACTIVE');
      if (activeMembersError) throw activeMembersError;
      notificationRecipients = (activeMembers || []).filter(m => m.id !== session.id).map(m => m.id);
      const recipientsData = notificationRecipients.map(recipient_id => ({ message_id: message.id, recipient_id }));
      if (recipientsData.length > 0) {
        const { error: insertRecipientsError } = await supabaseAdmin.from('message_recipients').insert(recipientsData);
        if (insertRecipientsError) {
          await supabaseAdmin.from('messages').delete().eq('id', message.id);
          throw insertRecipientsError;
        }
      }
    } else if (privateRecipient) {
      notificationRecipients = [privateRecipient.id];
      const { error: insertRecipientsError } = await supabaseAdmin.from('message_recipients').insert([
        { message_id: message.id, recipient_id: privateRecipient.id },
        { message_id: message.id, recipient_id: session.id, is_read: true, read_at: new Date().toISOString() }
      ]);
      if (insertRecipientsError) {
        await supabaseAdmin.from('messages').delete().eq('id', message.id);
        throw insertRecipientsError;
      }
    }

    if (notificationRecipients.length > 0) {
      const notificationLabel = messageScope === 'PRIVATE' ? 'Nouveau message privé' : 'Nouveau message à la plénière';
      const { error: notificationError } = await supabaseAdmin.from('notifications').insert(
        notificationRecipients.map(member_id => ({
          member_id,
          title: notificationLabel,
          content: `${session.firstName} ${session.lastName} vous a envoyé un message.`,
          link: '/messages',
        }))
      );
      if (notificationError) console.error('Message notification insert error:', notificationError);
      else {
        await sendWebPushToMembers(notificationRecipients, {
          title: notificationLabel,
          body: message.content.slice(0, 180),
          link: '/notifications',
        });
      }
    }

    await supabaseAdmin.from('audit_logs').insert({
      action: 'MESSAGE_SEND', actor_id: session.id, entity_type: 'Message', entity_id: message.id, details: JSON.stringify({ message: `Message ${messageScope}` })
    });

    const { data: fullMessageRaw } = await supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:members!messages_sender_id_fkey(id, first_name, last_name, access_level, photo_url)
      `)
      .eq('id', message.id)
      .single();

    const fullMessage = fullMessageRaw ? {
      ...fullMessageRaw,
      senderId: fullMessageRaw.sender_id,
      createdAt: fullMessageRaw.created_at,
      sender: fullMessageRaw.sender ? {
        id: Array.isArray(fullMessageRaw.sender) ? fullMessageRaw.sender[0].id : fullMessageRaw.sender.id,
        firstName: Array.isArray(fullMessageRaw.sender) ? fullMessageRaw.sender[0].first_name : fullMessageRaw.sender.first_name,
        lastName: Array.isArray(fullMessageRaw.sender) ? fullMessageRaw.sender[0].last_name : fullMessageRaw.sender.last_name,
        accessLevel: Array.isArray(fullMessageRaw.sender) ? fullMessageRaw.sender[0].access_level : fullMessageRaw.sender.access_level,
        photoUrl: Array.isArray(fullMessageRaw.sender) ? fullMessageRaw.sender[0].photo_url : fullMessageRaw.sender.photo_url,
      } : null,
    } : null;

    return NextResponse.json({ success: true, message: fullMessage }, { status: 201 });
  } catch (error) {
    console.error('Messages POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
