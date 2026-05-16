import { apiGet, apiPost } from '../client';

/**
 * Notification shape — mirror Prisma `Notification` model.
 */
export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  body: string | null;
  dataJson: unknown;
  readAt: string | null;
  createdAt: string;
}

export interface UiNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  time: string; // ISO
  read: boolean;
}

export function toUiNotification(dto: NotificationDto): UiNotification {
  return {
    id: dto.id,
    type: dto.type,
    title: dto.title,
    body: dto.body ?? '',
    time: dto.createdAt,
    read: dto.readAt !== null,
  };
}

export const notificationsApi = {
  list: async (): Promise<UiNotification[]> => {
    const list = await apiGet<NotificationDto[]>('/me/notifications');
    return list.map(toUiNotification);
  },

  markRead: (id: string) =>
    apiPost<NotificationDto>(`/me/notifications/${encodeURIComponent(id)}/read`),
};
