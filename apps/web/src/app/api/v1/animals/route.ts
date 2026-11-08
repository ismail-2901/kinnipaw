import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createSuccessResponse, createErrorResponse } from '@kinnipaw/contracts';
import { sanitizeInput } from '@kinnipaw/utils';
import { createClient } from '@/lib/supabase/server';

const createAnimalSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  species_id: z.string().uuid('Valid species ID required'),
  breed_id: z.string().uuid().nullable().optional(),
  sex: z.enum(['male', 'female', 'unknown']).default('unknown'),
  date_of_birth: z.string().nullable().optional(),
  approximate_age_months: z.number().int().min(0).max(600).nullable().optional(),
  color_description: z.string().max(100).nullable().optional(),
  size_category: z.enum(['tiny', 'small', 'medium', 'large', 'extra_large']).nullable().optional(),
  temperament_tags: z.array(z.string()).optional(),
  bio: z.string().max(1000).nullable().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
});

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

    const { data, error } = await supabase
      .from('animals')
      .select('*, species(name, slug), breeds(name, slug), animal_media(*)')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false });

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
    const parsed = createAnimalSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        createErrorResponse('VALIDATION_ERROR', 'Invalid animal details', requestId, parsed.error.format()),
        { status: 422 }
      );
    }

    // Server-enforced ownership: owner_id derived strictly from authenticated session
    const animalPayload = {
      owner_id: user.id,
      name: sanitizeInput(parsed.data.name),
      species_id: parsed.data.species_id,
      breed_id: parsed.data.breed_id || null,
      sex: parsed.data.sex,
      date_of_birth: parsed.data.date_of_birth || null,
      approximate_age_months: parsed.data.approximate_age_months || null,
      color_description: parsed.data.color_description ? sanitizeInput(parsed.data.color_description) : null,
      size_category: parsed.data.size_category || null,
      temperament_tags: parsed.data.temperament_tags || [],
      bio: parsed.data.bio ? sanitizeInput(parsed.data.bio) : null,
      visibility: parsed.data.visibility,
      animal_status: 'active' as const,
    };

    const { data: created, error } = await supabase
      .from('animals')
      .insert(animalPayload)
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
