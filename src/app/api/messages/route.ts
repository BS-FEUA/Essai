import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canSendMessage } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get('scope') || 'PLENIARY';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '30');

    let query = supabaseAdmin
      .from('messages')
      .select(`
        *,
        sender:members!messages_sender_id_fkey(id, first_name, last_name, access_level, photo_url),
        recipients:message_recipients(*)
      `, { count: 'exact' })
      .eq('scope', scope);

    if (scope === 'PRIVATE') {
      // Logic for private messages: sender is session.id OR session.id is in recipients
      // In Supabase, this can be tricky with OR on joined tables. We can just use a simpler query:
      // Since RLS is enabled, maybe we could just query, but we are using supabaseAdmin.
      query = query.or(`sender_id.eq.${session.id},id.in.(select message_id from message_recipients where recipient_id = '${session.id}')`);
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
      await supabaseAdmin.from('message_recipients').update({ is_read: true, read_at: new Date().toISOString() }).in('id', unreadIds);
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
    const { content, scope, recipientId } = body;

    if (!content || !content.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

    const messageScope = scope || 'PLENIARY';

    // Check messaging rules
    if (messageScope === 'PRIVATE' && recipientId) {
      const { data: recipient } = await supabaseAdmin.from('members').select('*').eq('id', recipientId).single();
      if (!recipient) return NextResponse.json({ error: 'Destinataire non trouvé' }, { status: 404 });
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

    // Add recipients
    if (messageScope === 'PLENIARY') {
      const { data: activeMembers } = await supabaseAdmin.from('members').select('id').eq('status', 'ACTIVE');
      if (activeMembers) {
        const recipientsData = activeMembers.filter(m => m.id !== session.id).map(m => ({ message_id: message.id, recipient_id: m.id }));
        if (recipientsData.length > 0) {
          await supabaseAdmin.from('message_recipients').insert(recipientsData);
        }
      }
    } else if (recipientId) {
      await supabaseAdmin.from('message_recipients').insert([
        { message_id: message.id, recipient_id: recipientId },
        { message_id: message.id, recipient_id: session.id, is_read: true, read_at: new Date().toISOString() }
      ]);
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
