import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';
import { z } from 'zod';

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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (registerId) where.registerId = registerId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      db.cashTransaction.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: { register: true, member: { select: { id: true, firstName: true, lastName: true, matricule: true } }, validator: { select: { id: true, firstName: true, lastName: true } } },
      }),
      db.cashTransaction.count({ where }),
    ]);

    return NextResponse.json({ transactions, total, page, limit, pages: Math.ceil(total / limit) });
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
    const tx = await db.cashTransaction.create({
      data: {
        registerId, type, amount,
        description: description || `${type} - ${targetMemberId}`,
        paymentMethod: paymentMethod || 'ESPECES',
        memberId: targetMemberId,
        status: type === 'DEPOSIT' ? 'COMPLETED' : 'PENDING',
      },
    });

    // Update register balance for completed deposits
    if (type === 'DEPOSIT') {
      await db.cashRegister.update({ where: { id: registerId }, data: { balance: { increment: amount } } });
    }

    await db.auditLog.create({
      data: { action: 'PAYMENT', actorId: session.id, entityType: 'CashTransaction', entityId: tx.id, details: `${type} ${amount} FCFA` },
    });

    return NextResponse.json({ success: true, transaction: tx }, { status: 201 });
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

    const tx = await db.cashTransaction.findUnique({ where: { id: transactionId } });
    if (!tx) return NextResponse.json({ error: 'Transaction non trouvée' }, { status: 404 });

    const updatedTx = await db.cashTransaction.update({
      where: { id: transactionId },
      data: { status, validatedBy: session.id, validatedAt: new Date() },
    });

    // Update register balance for completed withdrawals
    if (status === 'COMPLETED' && tx.status !== 'COMPLETED' && tx.type === 'WITHDRAWAL') {
      await db.cashRegister.update({ where: { id: tx.registerId }, data: { balance: { decrement: tx.amount } } });
    }

    return NextResponse.json({ success: true, transaction: updatedTx });
  } catch (error) {
    console.error('Cash PUT error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
