import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createHealthRecordSchema = z.object({
  record_type: z.enum(['checkup', 'surgery', 'diagnosis', 'test', 'other']),
  title: z.string().min(1).max(100),
  occurred_at: z.string(),
  notes: z.string().max(2000).nullable().optional(),
  provider_name: z.string().max(100).nullable().optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    // Health records are strictly owner-only (AGENTS.md §6 & §16)
    const { data: animal } = await supabase
      .from('animals')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!animal || animal.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Access to animal health records is restricted to the owner', requestId),
        { status: 403 }
      );
    }

    const [healthRes, vaxRes, medsRes] = await Promise.all([
      supabase.from('animal_health_records').select('*').eq('animal_id', id).order('occurred_at', { ascending: false }),
      supabase.from('vaccinations').select('*').eq('animal_id', id).order('administered_date', { ascending: false }),
      supabase.from('medications').select('*').eq('animal_id', id).order('created_at', { ascending: false }),
    ]);

    return NextResponse.json(
      createSuccessResponse(
        {
          records: healthRes.data || [],
          vaccinations: vaxRes.data || [],
          medications: medsRes.data || [],
        },
        requestId
      )
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
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

    const { data: animal } = await supabase
      .from('animals')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!animal || animal.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only the owner can add health records', requestId),
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = createHealthRecordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid health record data', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const recordPayload = {
      animal_id: id,
      recorded_by: user.id,
      record_type: parsed.data.record_type,
      title: sanitizeInput(parsed.data.title),
      occurred_at: parsed.data.occurred_at,
      notes: parsed.data.notes ? sanitizeInput(parsed.data.notes) : null,
      provider_name: parsed.data.provider_name ? sanitizeInput(parsed.data.provider_name) : null,
      visibility: 'private' as const,
    };

    const { data: created, error } = await supabase
      .from('animal_health_records')
      .insert(recordPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(created, requestId), { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
