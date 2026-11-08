import { z } from 'zod';

export const createConversationSchema = z.object({
  participant_id: z.string().uuid('Invalid participant ID'),
  initial_message: z.string().min(1).max(2000).optional(),
});

export const sendMessageSchema = z.object({
  body: z.string().min(1, 'Message cannot be empty').max(5000),
  attachments: z.array(z.string()).optional(),
});

export const updateNotificationPreferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  adoption_alerts: z.boolean().optional(),
  rescue_alerts: z.boolean().optional(),
  care_reminders: z.boolean().optional(),
});

export const registerDeviceTokenSchema = z.object({
  token: z.string().min(10, 'Invalid device token'),
  platform: z.enum(['ios', 'android', 'web']),
});

export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type UpdateNotificationPreferencesInput = z.infer<typeof updateNotificationPreferencesSchema>;
export type RegisterDeviceTokenInput = z.infer<typeof registerDeviceTokenSchema>;
