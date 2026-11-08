import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { createClient } from '@/lib/supabase/server';

export async function GET(_request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        createErrorResponse('UNAUTHORIZED', 'Authentication required', requestId),
        { status: 401 }
      );
    }

    // Verify admin / moderator role
    const { data: roleAssn } = await supabase
      .from('user_role_assignments')
      .select('role:roles(name)')
      .eq('user_id', user.id);

    const roles = (roleAssn || []).map((r: any) => r.role?.name);
    const isStaff = roles.includes('admin') || roles.includes('super_admin') || roles.includes('moderator');

    if (!isStaff) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access restricted to administrators and moderators', requestId),
        { status: 403 }
      );
    }

    // Parallel metric counts
    const [
      { count: totalUsers },
      { count: totalAnimals },
      { count: totalAdoptions },
      { count: activeRescues },
      { count: activeLostPosts },
      { count: pendingReports },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('animals').select('*', { count: 'exact', head: true }),
      supabase.from('adoption_listings').select('*', { count: 'exact', head: true }).eq('listing_status', 'active'),
      supabase.from('rescue_cases').select('*', { count: 'exact', head: true }).eq('case_status', 'open'),
      supabase.from('lost_found_posts').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('content_reports').select('*', { count: 'exact', head: true }).eq('report_status', 'pending'),
    ]);

    const metrics = {
      total_users: totalUsers || 0,
      total_animals: totalAnimals || 0,
      active_adoptions: totalAdoptions || 0,
      active_rescues: activeRescues || 0,
      active_lost_posts: activeLostPosts || 0,
      pending_reports: pendingReports || 0,
    };

    return NextResponse.json(createSuccessResponse(metrics, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
