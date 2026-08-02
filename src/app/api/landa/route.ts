import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { z } from 'zod';
import { randomUUID } from 'crypto';

const landaOrderSchema = z.object({
  name: z.string().min(2, 'Nom requis'),
  phone: z.string().min(8, 'Téléphone requis'),
  email: z.string().email('Email invalide').optional().or(z.literal('')),
  size: z.string().min(1, 'Taille requise'),
  quantity: z.number().int().min(1).max(10),
  institution: z.string().optional(),
  notes: z.string().optional(),
});

const UNIT_PRICE = 15000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = landaOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, phone, email, size, quantity, institution, notes } = parsed.data;
    const id = randomUUID();
    const totalAmount = quantity * UNIT_PRICE;
    const notesJson = JSON.stringify({ name, phone, email: email || undefined, institution, customerNotes: notes });

    // Use raw SQL to bypass Prisma client caching issue with optional memberId
    await db.$executeRawUnsafe(
      `INSERT INTO "UniformOrder" (id, taille, quantity, status, totalAmount, notes, "createdAt", "updatedAt") VALUES (?, ?, ?, 'EN_ATTENTE', ?, ?, datetime('now'), datetime('now'))`,
      id, size, quantity, totalAmount, notesJson
    );

    const auditId = randomUUID();
    const details = `Commande Landa: ${name} (${phone}), ${quantity}x ${size}`;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const ua = req.headers.get('user-agent') || null;

    await db.$executeRawUnsafe(
      `INSERT INTO "AuditLog" (id, action, entityType, entityId, details, ipAddress, userAgent) VALUES (?, 'UNIFORM_ORDER', 'UniformOrder', ?, ?, ?, ?)`,
      auditId, id, details, ip, ua
    );

    return NextResponse.json({
      success: true,
      order: { id, taille: size, quantity, totalAmount, status: 'EN_ATTENTE' },
    }, { status: 201 });
  } catch (error) {
    console.error('Landa POST error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const orders = await db.$queryRawUnsafe<Record<string, any>[]>(
      `SELECT * FROM "UniformOrder" WHERE "memberId" IS NULL ORDER BY "createdAt" DESC`
    );

    const enriched = orders.map((o) => {
      let info: Record<string, string> = {};
      try {
        info = o.notes ? JSON.parse(o.notes) : {};
      } catch {
        /* ignore parse errors */
      }
      return {
        ...o,
        publicName: info.name || '—',
        publicPhone: info.phone || '—',
        publicEmail: info.email || '',
        publicInstitution: info.institution || '',
        customerNotes: info.customerNotes || '',
      };
    });

    return NextResponse.json({ orders: enriched });
  } catch (error) {
    console.error('Landa GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
