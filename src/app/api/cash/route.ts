import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';
import { z } from 'zod';
import { getPagination } from '@/lib/pagination';

const createTransactionSchema = z.object({
  registerId: z.string().min(1).max(64),
  type: z.enum(['DEPOSIT', 'WITHDRAWAL', 'PAYMENT', 'TRANSFER', 'REFUND']),
  amount: z.number().int().positive().max(10_000_000),
  description: z.string().trim().max(500).optional(),
  paymentMethod: z.string().trim().max(50).optional(),
  memberId: z.string().min(1).max(64).optional(),
});

const validateTransactionSchema = z.object({
  transactionId: z.string().min(1).max(64),
  status: z.enum(['PENDING', 'COMPLETED', 'FAILED', 'CANCELLED']),
});

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MASTER')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const registerId = searchParams.get('registerId') || '';
    const type = searchParams.get('type') || '';
    const status = searchParams.get('status') || '';
    const { page, limit, from, to } = getPagination(searchParams, 20);

    let query = supabaseAdmin
      .from('cash_transactions')
      .select(`
        *,
        register:cash_registers(*),
        member:members!cash_transactions_member_id_fkey(id, first_name, last_name, matricule),
        validator:members!cash_transactions_validated_by_fkey(id, first_name, last_name)
      `, { count: 'exact' });

    if (registerId) query = query.eq('register_id', registerId);
    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    query = query.order('created_at', { ascending: false }).range(from, to);

    const { data: transactionsRaw, count, error } = await query;

    if (error) throw error;

    const transactions = (transactionsRaw || []).map(t => ({
      ...t,
      registerId: t.register_id,
      memberId: t.member_id,
      paymentMethod: t.payment_method,
      validatedBy: t.validated_by,
      validatedAt: t.validated_at,
      createdAt: t.created_at,
      updatedAt: t.updated_at,
      member: t.member ? {
        id: Array.isArray(t.member) ? t.member[0].id : t.member.id,
        firstName: Array.isArray(t.member) ? t.member[0].first_name : t.member.first_name,
        lastName: Array.isArray(t.member) ? t.member[0].last_name : t.member.last_name,
        matricule: Array.isArray(t.member) ? t.member[0].matricule : t.member.matricule,
      } : null,
      validator: t.validator ? {
        id: Array.isArray(t.validator) ? t.validator[0].id : t.validator.id,
        firstName: Array.isArray(t.validator) ? t.validator[0].first_name : t.validator.first_name,
        lastName: Array.isArray(t.validator) ? t.validator[0].last_name : t.validator.last_name,
      } : null,
    }));

    return NextResponse.json({ transactions, total: count || 0, page, limit, pages: Math.ceil((count || 0) / limit) });
  } catch (error) {
    console.error('Cash GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const parsed = createTransactionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Transaction invalide' }, { status: 400 });
    const { registerId, type, amount, description, paymentMethod, memberId } = parsed.data;

    if (!registerId || !type || !amount) {
      return NextResponse.json({ error: 'Données manquantes' }, { status: 400 });
    }

    const targetMemberId = memberId || session.id;
    if (targetMemberId !== session.id && !canAccess(session.accessLevel, 'MASTER')) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }
    
    const { data: tx, error } = await supabaseAdmin.from('cash_transactions').insert({
      register_id: registerId, 
      type, 
      amount,
      description: description || `${type} - ${targetMemberId}`,
      payment_method: paymentMethod || 'ESPECES',
      member_id: targetMemberId,
      status: type === 'DEPOSIT' ? 'COMPLETED' : 'PENDING',
    }).select().single();
    
    if (error) throw error;

    // Trigger update_cash_balance in PostgreSQL handles the register balance update automatically

    await supabaseAdmin.from('audit_logs').insert({
      action: 'PAYMENT', actor_id: session.id, entity_type: 'CashTransaction', entity_id: tx.id, details: JSON.stringify({ message: `${type} ${amount} FCFA` })
    });

    const mappedTx = {
      ...tx,
      registerId: tx.register_id,
      memberId: tx.member_id,
      paymentMethod: tx.payment_method,
      validatedBy: tx.validated_by,
      validatedAt: tx.validated_at,
      createdAt: tx.created_at,
      updatedAt: tx.updated_at,
    };

    return NextResponse.json({ success: true, transaction: mappedTx }, { status: 201 });
  } catch (error) {
    console.error('Cash POST error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST_IN')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const parsed = validateTransactionSchema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: 'Validation invalide' }, { status: 400 });
    const { transactionId, status } = parsed.data;

    if (!transactionId) return NextResponse.json({ error: 'ID requis' }, { status: 400 });

    const { data: tx } = await supabaseAdmin.from('cash_transactions').select('*').eq('id', transactionId).single();
    if (!tx) return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 });

    const { data: updatedTxRaw, error } = await supabaseAdmin.from('cash_transactions').update({
      status, 
      validated_by: session.id, 
      validated_at: new Date().toISOString()
    }).eq('id', transactionId).select().single();

    if (error) throw error;

    // Trigger update_cash_balance in PostgreSQL handles the register balance update automatically

    const updatedTx = {
      ...updatedTxRaw,
      registerId: updatedTxRaw.register_id,
      memberId: updatedTxRaw.member_id,
      paymentMethod: updatedTxRaw.payment_method,
      validatedBy: updatedTxRaw.validated_by,
      validatedAt: updatedTxRaw.validated_at,
      createdAt: updatedTxRaw.created_at,
      updatedAt: updatedTxRaw.updated_at,
    };

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('Cash PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
