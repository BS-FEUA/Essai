import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/db';
import { getSession, canAccess } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
    if (!canAccess(session.accessLevel, 'MAST_IN')) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

    const { searchParams } = new URL(req.url);
    const section = searchParams.get('section') || 'overview';

    // Overview stats
    if (section === 'overview') {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [
        { count: totalMembers },
        { count: activeMembers },
        { count: pendingMembers },
        { data: registersData },
        { count: totalTransactions },
        { count: totalOrders },
        { count: pendingOrders },
        { count: recentLogins },
        { data: membersByLevelRaw },
        { data: membersByInstitutionRaw },
        { data: membersByFiliereRaw },
        { data: ficheStatsRaw },
      ] = await Promise.all([
        supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).not('email', 'like', 'deleted+%@example.invalid'),
        supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).not('email', 'like', 'deleted+%@example.invalid').eq('status', 'ACTIVE'),
        supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).not('email', 'like', 'deleted+%@example.invalid').eq('status', 'PENDING_VALIDATION'),
        supabaseAdmin.from('cash_registers').select('balance').eq('is_active', true),
        supabaseAdmin.from('cash_transactions').select('*', { count: 'exact', head: true }).eq('status', 'COMPLETED'),
        supabaseAdmin.from('uniform_orders').select('*', { count: 'exact', head: true }),
        supabaseAdmin.from('uniform_orders').select('*', { count: 'exact', head: true }).eq('status', 'EN_ATTENTE'),
        supabaseAdmin.from('members').select('*', { count: 'exact', head: true }).not('email', 'like', 'deleted+%@example.invalid').gte('last_login_at', sevenDaysAgo),
        supabaseAdmin.from('members').select('access_level').not('email', 'like', 'deleted+%@example.invalid'),
        supabaseAdmin.from('members').select('institution').not('email', 'like', 'deleted+%@example.invalid').not('institution', 'is', null),
        supabaseAdmin.from('members').select('filiere').not('email', 'like', 'deleted+%@example.invalid').not('filiere', 'is', null),
        supabaseAdmin.from('members').select('fiche_soumise').not('email', 'like', 'deleted+%@example.invalid'),
      ]);

      const totalBalance = (registersData || []).reduce((sum: number, r: any) => sum + (r.balance || 0), 0);

      // Group by access_level
      const membersByLevel = Object.entries(
        (membersByLevelRaw || []).reduce((acc: Record<string, number>, m: any) => {
          acc[m.access_level] = (acc[m.access_level] || 0) + 1;
          return acc;
        }, {})
      ).map(([accessLevel, count]) => ({ accessLevel, _count: count }));

      // Group by institution
      const membersByInstitution = Object.entries(
        (membersByInstitutionRaw || []).reduce((acc: Record<string, number>, m: any) => {
          if (m.institution) acc[m.institution] = (acc[m.institution] || 0) + 1;
          return acc;
        }, {})
      ).map(([institution, count]) => ({ institution, _count: count }));

      // Group by filiere
      const membersByFiliere = Object.entries(
        (membersByFiliereRaw || []).reduce((acc: Record<string, number>, m: any) => {
          if (m.filiere) acc[m.filiere] = (acc[m.filiere] || 0) + 1;
          return acc;
        }, {})
      ).map(([filiere, count]) => ({ filiere, _count: count }));

      // Group by fiche_soumise
      const ficheStats = Object.entries(
        (ficheStatsRaw || []).reduce((acc: Record<string, number>, m: any) => {
          const key = String(m.fiche_soumise);
          acc[key] = (acc[key] || 0) + 1;
          return acc;
        }, {})
      ).map(([ficheSoumise, count]) => ({ ficheSoumise: ficheSoumise === 'true', _count: count }));

      return NextResponse.json({
        totalMembers: totalMembers || 0,
        activeMembers: activeMembers || 0,
        pendingMembers: pendingMembers || 0,
        totalBalance: registersData?.length ? totalBalance : null,
        totalTransactions: totalTransactions || 0,
        totalOrders: totalOrders || 0,
        pendingOrders: pendingOrders || 0,
        recentLogins: recentLogins || 0,
        membersByLevel,
        membersByInstitution,
        membersByFiliere,
        ficheStats,
      });
    }

    // Audit logs (Mémoire H)
    if (section === 'audit') {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '30');
      const action = searchParams.get('action') || '';
      const actorId = searchParams.get('actorId') || '';

      let query = supabaseAdmin
        .from('audit_logs')
        .select(`
          *,
          actor:members!audit_logs_actor_id_fkey(id, first_name, last_name, matricule, access_level)
        `, { count: 'exact' });

      if (action) query = query.eq('action', action);
      if (actorId) query = query.eq('actor_id', actorId);

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.order('created_at', { ascending: false }).range(from, to);

      const { data: logsRaw, count, error } = await query;

      if (error) throw error;

      const logs = (logsRaw || []).map(l => ({
        ...l,
        actorId: l.actor_id,
        entityType: l.entity_type,
        entityId: l.entity_id,
        ipAddress: l.ip_address,
        userAgent: l.user_agent,
        createdAt: l.created_at,
        actor: l.actor ? {
          id: Array.isArray(l.actor) ? l.actor[0].id : l.actor.id,
          firstName: Array.isArray(l.actor) ? l.actor[0].first_name : l.actor.first_name,
          lastName: Array.isArray(l.actor) ? l.actor[0].last_name : l.actor.last_name,
          matricule: Array.isArray(l.actor) ? l.actor[0].matricule : l.actor.matricule,
          accessLevel: Array.isArray(l.actor) ? l.actor[0].access_level : l.actor.access_level,
        } : null,
      }));

      return NextResponse.json({ logs, total: count || 0, page, limit, pages: Math.ceil((count || 0) / limit) });
    }

    return NextResponse.json({ error: 'Section non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('Admin GET error:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
