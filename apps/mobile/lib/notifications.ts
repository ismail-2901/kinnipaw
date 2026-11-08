import { supabase } from './supabase';

export interface DeviceTokenPayload {
  token: string;
  platform: 'android' | 'ios' | 'web';
  device_name?: string;
}

/**
 * Register push notification device token with the KINNIPAW server
 */
export async function registerDeviceToken(payload: DeviceTokenPayload): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return false;

    const { error } = await supabase.from('device_tokens').upsert(
      {
        user_id: session.user.id,
        token: payload.token,
        platform: payload.platform,
        device_name: payload.device_name || 'Mobile Device',
        is_active: true,
        last_used_at: new Date().toISOString(),
      },
      { onConflict: 'token' }
    );

    return !error;
  } catch (err) {
    console.error('Failed to register device token:', err);
    return false;
  }
}

/**
 * Unregister device token on sign out
 */
export async function unregisterDeviceToken(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .update({ is_active: false })
      .eq('token', token);

    return !error;
  } catch (err) {
    console.error('Failed to unregister device token:', err);
    return false;
  }
}
