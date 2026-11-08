import { supabase } from './supabase';

export interface UploadOptions {
  bucket: 'animal-media' | 'post-media' | 'lost-found-media' | 'rescue-media';
  path: string;
  fileBytes: Uint8Array;
  contentType: string;
}

export interface UploadResult {
  url?: string;
  error?: string;
}

/**
 * Mobile Media Upload Service
 * Strips client metadata headers and uploads directly to Supabase Storage with strict mime verification.
 */
export async function uploadMediaAsset(options: UploadOptions): Promise<UploadResult> {
  try {
    // Validate file size (max 10MB)
    if (options.fileBytes.length > 10 * 1024 * 1024) {
      return { error: 'File size exceeds maximum permitted limit (10MB).' };
    }

    // Supported MIME types
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(options.contentType)) {
      return { error: 'Invalid file format. Only JPEG, PNG, and WebP are allowed.' };
    }

    const { data, error } = await supabase.storage
      .from(options.bucket)
      .upload(options.path, options.fileBytes, {
        contentType: options.contentType,
        upsert: false,
      });

    if (error) {
      return { error: error.message };
    }

    const { data: publicUrlData } = supabase.storage
      .from(options.bucket)
      .getPublicUrl(data.path);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { error: err.message || 'Media upload failed' };
  }
}
