import React, { useCallback, useEffect, useState } from 'react';
import { Bell, CheckCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { NotificationRow } from '../../components/common/AdminNotificationCenter';
import { useToast } from '../../context/ToastContext';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import type { AdminNotification } from '../../types/notifications';

export const AdminNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/notifications?page=${page}&limit=20`);
      setNotifications(response.data?.data || []);
      setUnreadCount(response.data?.meta?.unreadCount || 0);
      setTotalPages(response.data?.meta?.totalPages || 1);
      setError('');
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const announceUpdate = () => window.dispatchEvent(new Event('cms:notifications-updated'));

  const selectNotification = async (notification: AdminNotification) => {
    if (!notification.isRead) {
      try {
        await apiClient.patch(`/notifications/${notification._id}/read`);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        setUnreadCount((count) => Math.max(0, count - 1));
        announceUpdate();
      } catch (requestError) {
        showToast(extractApiErrorMessage(requestError), 'error');
        return;
      }
    }
    navigate(notification.targetUrl);
  };

  const deleteNotification = async (notification: AdminNotification) => {
    try {
      await apiClient.delete(`/notifications/${notification._id}`);
      setNotifications((current) => current.filter((item) => item._id !== notification._id));
      if (!notification.isRead) setUnreadCount((count) => Math.max(0, count - 1));
      announceUpdate();
    } catch (requestError) {
      showToast(extractApiErrorMessage(requestError), 'error');
    }
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
      announceUpdate();
    } catch (requestError) {
      showToast(extractApiErrorMessage(requestError), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-1 text-xs text-[#B5BCD9]">
            Persistent updates for important activity in your portfolio.
          </p>
        </div>
        <button
          type="button"
          onClick={markAllRead}
          disabled={unreadCount === 0}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#090E2C] px-3 py-2 text-xs font-semibold text-[#00D9FF] hover:border-[#8B19FF]/50 disabled:opacity-40"
        >
          <CheckCheck className="h-4 w-4" />
          Mark all read
        </button>
      </header>

      <section className="cosmic-card overflow-hidden rounded-2xl">
        <div className="flex items-center justify-between border-b border-white/[0.08] px-4 py-3">
          <span className="flex items-center gap-2 text-xs font-semibold text-white">
            <Bell className="h-4 w-4 text-[#00D9FF]" />
            {unreadCount} unread
          </span>
          <span className="text-[11px] text-[#B5BCD9]">Newest first</span>
        </div>
        {loading ? (
          <div className="space-y-4 p-6 animate-pulse" aria-label="Loading notifications">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 rounded-xl bg-white/[0.04]" />
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <p className="text-sm text-rose-300">{error}</p>
            <button
              type="button"
              onClick={() => void loadNotifications()}
              className="mt-3 text-xs font-semibold text-[#00D9FF] hover:underline"
            >
              Retry
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <Bell className="mx-auto h-8 w-8 text-[#B5BCD9]/60" />
            <p className="mt-3 text-sm font-semibold text-white">No notifications yet</p>
            <p className="mt-1 text-xs text-[#B5BCD9]">
              Important admin activity will be saved here.
            </p>
          </div>
        ) : (
          notifications.map((notification) => (
            <NotificationRow
              key={notification._id}
              notification={notification}
              onSelect={selectNotification}
              onDelete={deleteNotification}
            />
          ))
        )}
      </section>

      <nav className="flex items-center justify-between gap-3" aria-label="Notification pages">
        <button
          type="button"
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          disabled={page <= 1 || loading}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#090E2C] px-3 py-2 text-xs text-white disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" /> Previous
        </button>
        <span className="text-xs text-[#B5BCD9]">
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          disabled={page >= totalPages || loading}
          className="inline-flex items-center gap-1 rounded-xl border border-white/10 bg-[#090E2C] px-3 py-2 text-xs text-white disabled:opacity-40"
        >
          Next <ChevronRight className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
};
