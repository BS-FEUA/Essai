import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { z } from 'zod';
import { canAccess, getSession } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

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
    if (!await checkRateLimit(`landa:${getClientIp(req.headers)}`, 10, 60 * 60 * 1000)) {
      return NextResponse.json({ error: 'Trop de demandes. Réessayez plus tard.' }, { status: 429 });
    }
    const body = await req.json();
    const parsed = landaOrderSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides', details: parsed.error.flatten() }, { status: 400 });
    }

    const { name, phone, email, size, quantity, institution, notes } = parsed.data;
    const totalAmount = quantity * UNIT_PRICE;
    const notesJson = JSON.stringify({ name, phone, email: email || undefined, institution, customerNotes: notes });

    const { data: order, error: orderError } = await supabaseAdmin
      .from('uniform_orders')
      .insert({
        taille: size,
        quantity,
        status: 'EN_ATTENTE',
        total_amount: totalAmount,
        notes: notesJson,
        // member_id is intentionally left NULL for public "Landa" orders
      })
      .select()
      .single();

    if (orderError) throw orderError;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || null;
    const ua = req.headers.get('user-agent') || null;
    const details = `Commande Landa: ${name} (${phone}), ${quantity}x ${size}`;

    await supabaseAdmin.from('audit_logs').insert({
      action: 'UNIFORM_ORDER',
      entity_type: 'UniformOrder',
      entity_id: order.id,
      details: JSON.stringify({ message: details }),
      ip_address: ip,
      user_agent: ua,
    });

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        taille: size,
        quantity,
        totalAmount,
        status: 'EN_ATTENTE',
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Landa POST error:', JSON.stringify(error, null, 2));
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MASTER')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    // Public Landa orders have NULL member_id
    const { data: ordersRaw, error } = await supabaseAdmin
      .from('uniform_orders')
      .select('*')
      .is('member_id', null)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const enriched = (ordersRaw || []).map((o) => {
      let info: Record<string, string> = {};
      try {
        info = o.notes ? JSON.parse(o.notes) : {};
      } catch {
        /* ignore parse errors */
      }
      return {
        ...o,
        memberId: o.member_id,
        totalAmount: o.total_amount,
        paymentMethod: o.payment_method,
        paymentRef: o.payment_ref,
        createdAt: o.created_at,
        updatedAt: o.updated_at,
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
