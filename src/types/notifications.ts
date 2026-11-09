export interface AdminNotification {
  _id: string;
  type: 'contact_message' | 'newsletter_subscription';
  title: string;
  message: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPageResponse {
  data: AdminNotification[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    unreadCount: number;
  };
}
