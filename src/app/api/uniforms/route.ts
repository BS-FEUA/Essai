import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabaseAdmin
      .from('uniform_orders')
      .select(`
        *,
        member:members!uniform_orders_member_id_fkey(id, first_name, last_name, matricule, phone),
        validator1:members!uniform_orders_validated1_by_fkey(id, first_name, last_name),
        validator2:members!uniform_orders_validated2_by_fkey(id, first_name, last_name)
      `, { count: 'exact' });

    if (status) query = query.eq('status', status);

    // MIN/MIX only see their own orders
    if (!canAccess(session.accessLevel, 'MASTER')) {
      query = query.eq('member_id', session.id);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: ordersRaw, count, error } = await query;

    if (error) throw error;

    const orders = (ordersRaw || []).map(o => ({
      ...o,
      memberId: o.member_id,
      totalAmount: o.total_amount,
      paymentMethod: o.payment_method,
      paymentRef: o.payment_ref,
      validated1By: o.validated1_by,
      validated1At: o.validated1_at,
      validated2By: o.validated2_by,
      validated2At: o.validated2_at,
      livredAt: o.livred_at,
      createdAt: o.created_at,
      updatedAt: o.updated_at,
      member: o.member ? {
        id: Array.isArray(o.member) ? o.member[0].id : o.member.id,
        firstName: Array.isArray(o.member) ? o.member[0].first_name : o.member.first_name,
        lastName: Array.isArray(o.member) ? o.member[0].last_name : o.member.last_name,
        matricule: Array.isArray(o.member) ? o.member[0].matricule : o.member.matricule,
        phone: Array.isArray(o.member) ? o.member[0].phone : o.member.phone,
      } : null,
      validator1: o.validator1 ? {
        id: Array.isArray(o.validator1) ? o.validator1[0].id : o.validator1.id,
        firstName: Array.isArray(o.validator1) ? o.validator1[0].first_name : o.validator1.first_name,
        lastName: Array.isArray(o.validator1) ? o.validator1[0].last_name : o.validator1.last_name,
      } : null,
      validator2: o.validator2 ? {
        id: Array.isArray(o.validator2) ? o.validator2[0].id : o.validator2.id,
        firstName: Array.isArray(o.validator2) ? o.validator2[0].first_name : o.validator2.first_name,
        lastName: Array.isArray(o.validator2) ? o.validator2[0].last_name : o.validator2.last_name,
      } : null,
    }));

    return NextResponse.json({ orders, total: count || 0, page, limit, pages: Math.ceil((count || 0) / limit) });
  } catch (error) {
    console.error('Uniforms GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { taille, quantity, notes } = body;
    const cycle = body.cycle || 1;
    const unitPrice = 15000;

    const { data: order, error } = await supabaseAdmin.from('uniform_orders').insert({
      member_id: session.id, 
      cycle, 
      taille, 
      quantity: quantity || 1,
      total_amount: (quantity || 1) * unitPrice, 
      notes,
      payment_method: body.paymentMethod, 
      payment_ref: body.paymentRef,
    }).select().single();

    if (error) throw error;

    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (error) {
    console.error('Uniforms POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MASTER')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const body = await req.json();
    const { orderId, status: newStatus } = body;

    if (!orderId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const { data: order } = await supabaseAdmin.from('uniform_orders').select('*').eq('id', orderId).single();
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });

    const updateData: any = { status: newStatus };

    // Double validation flow
    if (newStatus === 'VAL1') {
      updateData.validated1_by = session.id;
      updateData.validated1_at = new Date().toISOString();
    } else if (newStatus === 'VAL2') {
      updateData.validated2_by = session.id;
      updateData.validated2_at = new Date().toISOString();
    } else if (newStatus === 'LIVRE') {
      updateData.livred_at = new Date().toISOString();
    }

    const { data: updated, error } = await supabaseAdmin.from('uniform_orders').update(updateData).eq('id', orderId).select().single();
    if (error) throw error;
    
    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Uniforms PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (session.accessLevel !== 'CEO') return NextResponse.json({ error: 'Action réservée au CEO' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');
    if (!orderId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const { data: order } = await supabaseAdmin.from('uniform_orders').select('*').eq('id', orderId).single();
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });

    const { error } = await supabaseAdmin.from('uniform_orders').delete().eq('id', orderId);
    if (error) throw error;
    
    await supabaseAdmin.from('audit_logs').insert({ action: 'UNIFORM_ORDER', actor_id: session.id, entity_type: 'UniformOrder', entity_id: orderId, details: JSON.stringify({ message: `Suppression CEO de la commande ${orderId}` }) });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Uniforms DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
