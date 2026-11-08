import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const updateAnimalSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  species_id: z.string().uuid().optional(),
  breed_id: z.string().uuid().nullable().optional(),
  sex: z.enum(['male', 'female', 'unknown']).optional(),
  date_of_birth: z.string().nullable().optional(),
  approximate_age_months: z.number().int().min(0).max(600).nullable().optional(),
  color_description: z.string().max(100).nullable().optional(),
  size_category: z.enum(['tiny', 'small', 'medium', 'large', 'extra_large']).nullable().optional(),
  temperament_tags: z.array(z.string()).optional(),
  bio: z.string().max(1000).nullable().optional(),
  visibility: z.enum(['public', 'private']).optional(),
  animal_status: z.enum(['active', 'lost', 'found', 'adopted', 'deceased']).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;
  const requestId = crypto.randomUUID();

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: animal, error } = await supabase
      .from('animals')
      .select('*, species(name, slug), breeds(name, slug), animal_media(*)')
      .eq('id', id)
      .single();

    if (error || !animal) {
      return NextResponse.json(
        createErrorResponse('NOT_FOUND', 'Animal profile not found', requestId),
        { status: 404 }
      );
    }

    // Access control: if private, must be owner
    if (animal.visibility === 'private' && animal.owner_id !== user?.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'This animal profile is private', requestId),
        { status: 403 }
      );
    }

    return NextResponse.json(createSuccessResponse(animal, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
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

    // Verify ownership before modifying
    const { data: existing } = await supabase
      .from('animals')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only the owner can modify this animal', requestId),
        { status: 403 }
      );
    }

    const json = await request.json();
    const parsed = updateAnimalSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid update fields', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (parsed.data.name) updatePayload.name = sanitizeInput(parsed.data.name);
    if (parsed.data.species_id) updatePayload.species_id = parsed.data.species_id;
    if (parsed.data.breed_id !== undefined) updatePayload.breed_id = parsed.data.breed_id;
    if (parsed.data.sex) updatePayload.sex = parsed.data.sex;
    if (parsed.data.date_of_birth !== undefined) updatePayload.date_of_birth = parsed.data.date_of_birth;
    if (parsed.data.approximate_age_months !== undefined) updatePayload.approximate_age_months = parsed.data.approximate_age_months;
    if (parsed.data.color_description !== undefined) updatePayload.color_description = parsed.data.color_description ? sanitizeInput(parsed.data.color_description) : null;
    if (parsed.data.size_category !== undefined) updatePayload.size_category = parsed.data.size_category;
    if (parsed.data.temperament_tags) updatePayload.temperament_tags = parsed.data.temperament_tags;
    if (parsed.data.bio !== undefined) updatePayload.bio = parsed.data.bio ? sanitizeInput(parsed.data.bio) : null;
    if (parsed.data.visibility) updatePayload.visibility = parsed.data.visibility;
    if (parsed.data.animal_status) updatePayload.animal_status = parsed.data.animal_status;

    const { data: updated, error } = await supabase
      .from('animals')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse(updated, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
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

    const { data: existing } = await supabase
      .from('animals')
      .select('owner_id')
      .eq('id', id)
      .single();

    if (!existing || existing.owner_id !== user.id) {
      return NextResponse.json(
        createErrorResponse('FORBIDDEN', 'Only the owner can delete this animal', requestId),
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('animals')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json(
        createErrorResponse('DATABASE_ERROR', error.message, requestId),
        { status: 400 }
      );
    }

    return NextResponse.json(createSuccessResponse({ deleted: true }, requestId));
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      createErrorResponse('INTERNAL_SERVER_ERROR', msg, requestId),
      { status: 500 }
    );
  }
}
