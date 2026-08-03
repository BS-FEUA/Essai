import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = {};
    if (status) where.status = status;

    // MIN/MIX only see their own orders
    if (!canAccess(session.accessLevel, 'MASTER')) {
      where.memberId = session.id;
    }

    const [orders, total] = await Promise.all([
      db.uniformOrder.findMany({
        where, skip: (page - 1) * limit, take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          member: { select: { id: true, firstName: true, lastName: true, matricule: true, phone: true } },
          validator1: { select: { id: true, firstName: true, lastName: true } },
          validator2: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      db.uniformOrder.count({ where }),
    ]);

    return NextResponse.json({ orders, total, page, limit, pages: Math.ceil(total / limit) });
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

    const order = await db.uniformOrder.create({
      data: {
        memberId: session.id, cycle, taille, quantity: quantity || 1,
        totalAmount: (quantity || 1) * unitPrice, notes,
        paymentMethod: body.paymentMethod, paymentRef: body.paymentRef,
      },
    });

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

    const order = await db.uniformOrder.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });

    const updateData: any = { status: newStatus };

    // Double validation flow
    if (newStatus === 'VAL1') {
      updateData.validated1By = session.id;
      updateData.validated1At = new Date();
    } else if (newStatus === 'VAL2') {
      updateData.validated2By = session.id;
      updateData.validated2At = new Date();
    } else if (newStatus === 'LIVRE') {
      updateData.livredAt = new Date();
    }

    const updated = await db.uniformOrder.update({ where: { id: orderId }, data: updateData });
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

    const order = await db.uniformOrder.findUnique({ where: { id: orderId } });
    if (!order) return NextResponse.json({ error: 'Commande non trouvée' }, { status: 404 });

    await db.uniformOrder.delete({ where: { id: orderId } });
    await db.auditLog.create({ data: { action: 'UNIFORM_ORDER', actorId: session.id, entityType: 'UniformOrder', entityId: orderId, details: `Suppression CEO de la commande ${orderId}` } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Uniforms DELETE error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
