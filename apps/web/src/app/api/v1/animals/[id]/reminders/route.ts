import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createReminderSchema = z.object({
  reminder_type: z.enum(['vaccination', 'medication', 'checkup', 'grooming', 'other']),
  title: z.string().min(1).max(100),
  due_date: z.string(),
  is_recurring: z.boolean().default(false),
  recurrence_interval_days: z.number().int().min(1).max(365).nullable().optional(),
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

    const { data: animal } = await supabase
      .from('animals')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!animal || animal.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Reminders are private to the animal owner', requestId),
        { status: 403 }
      );
    }

    const { data, error } = await supabase
      .from('care_reminders')
      .select('*')
      .eq('animal_id', id)
      .order('due_date', { ascending: true });

    if (error) {
      return NextResponse.json(createSuccessResponse([], requestId));
    }

    return NextResponse.json(createSuccessResponse(data || [], requestId));
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
        createErrorResponse('FORBIDDEN', 'Only the owner can create reminders', requestId),
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = createReminderSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid reminder details', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const reminderPayload = {
      animal_id: id,
      created_by: user.id,
      reminder_type: parsed.data.reminder_type,
      title: sanitizeInput(parsed.data.title),
      due_date: parsed.data.due_date,
      is_recurring: parsed.data.is_recurring,
      recurrence_interval_days: parsed.data.recurrence_interval_days || null,
      is_completed: false,
    };

    const { data: created, error } = await supabase
      .from('care_reminders')
      .insert(reminderPayload)
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
