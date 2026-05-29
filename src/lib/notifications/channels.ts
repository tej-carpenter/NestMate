export type NotificationChannel = "sms" | "email" | "push";

export interface NotificationEvent {
  channel: NotificationChannel;
  recipient: string;
  subject: string;
  body: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface NotificationProvider {
  send(event: NotificationEvent): Promise<void>;
}