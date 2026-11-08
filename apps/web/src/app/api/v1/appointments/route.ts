import { NextResponse, type NextRequest } from 'next/server';
import { createSuccessResponse, createErrorResponse, createAppointmentSchema } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'client'; // client | provider

    if (role === 'provider') {
      const { data: myProfiles } = await supabase
        .from('provider_profiles')
        .select('id')
        .eq('user_id', user.id);

      const providerIds = (myProfiles || []).map((p) => p.id);

      if (providerIds.length === 0) {
        return NextResponse.json(createSuccessResponse([], requestId));
      }

      const { data: appointments, error } = await supabase
        .from('appointments')
        .select(`
          *,
          animal:animals(id, name, species:species(common_name)),
          client:profiles!requested_by(id, display_name, username)
        `)
        .in('provider_profile_id', providerIds)
        .order('requested_at', { ascending: false });

      if (error) {
        return NextResponse.json(createSuccessResponse([], requestId));
      }

      return NextResponse.json(createSuccessResponse(appointments || [], requestId));
    }

    // Default: client appointments
    const { data: appointments, error } = await supabase
      .from('appointments')
      .select(`
        *,
        animal:animals(id, name, species:species(common_name)),
        provider:provider_profiles(id, public_name, provider_type, public_address)
      `)
      .eq('requested_by', user.id)
      .order('requested_at', { ascending: false });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(appointments || [], requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const json = await request.json();
    const parsed = createAppointmentSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid appointment data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const appointmentPayload = {
      provider_profile_id: parsed.data.provider_profile_id,
      animal_id: parsed.data.animal_id,
      requested_by: user.id,
      requested_at: parsed.data.requested_at,
      appointment_status: 'pending' as const,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : null,
    };

    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert(appointmentPayload)
      .select(`
        *,
        animal:animals(name),
        provider:provider_profiles(public_name)
      `)
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(appointment, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
