import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, Check, Circle, Inbox, Trash2, UserPlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { AdminNotification } from '../../types/notifications';

function relativeTime(value: string): string {
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return 'Recently';
  const seconds = Math.max(0, Math.floor((Date.now() - timestamp) / 1000));
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  return new Date(value).toLocaleDateString();
}

export const NotificationRow: React.FC<{
  notification: AdminNotification;
  onSelect: (notification: AdminNotification) => void;
  onDelete?: (notification: AdminNotification) => void;
}> = ({ notification, onSelect, onDelete }) => (
  <div
    className={`group flex items-start gap-3 border-b border-white/[0.07] px-4 py-3 last:border-b-0 ${
      notification.isRead ? 'bg-transparent' : 'bg-[#8B19FF]/[0.09]'
    }`}
  >
    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#00D9FF]/10 text-[#00D9FF]">
      {notification.type === 'newsletter_subscription' ? (
        <UserPlus className="h-4 w-4" />
      ) : (
        <Inbox className="h-4 w-4" />
      )}
    </span>
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className="min-w-0 flex-1 text-left"
      aria-label={`Open ${notification.title}: ${notification.message}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className="truncate text-xs font-bold text-white">{notification.title}</span>
        {!notification.isRead && (
          <Circle
            className="mt-0.5 h-2.5 w-2.5 shrink-0 fill-[#00D9FF] text-[#00D9FF]"
            aria-label="Unread"
          />
        )}
      </span>
      <span className="mt-1 block line-clamp-2 text-[11px] leading-relaxed text-[#B5BCD9]">
        {notification.message}
      </span>
      <span className="mt-1.5 block text-[10px] text-[#B5BCD9]/65">
        {relativeTime(notification.createdAt)}
      </span>
    </button>
    {onDelete && (
      <button
        type="button"
        onClick={() => onDelete(notification)}
        aria-label={`Delete ${notification.title}`}
        className="rounded-lg p-1.5 text-[#B5BCD9]/60 opacity-70 transition-colors hover:bg-rose-500/15 hover:text-rose-300 sm:opacity-0 sm:group-hover:opacity-100"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

interface AdminNotificationCenterProps {
  onUnreadCountChange?: (count: number) => void;
}

export const AdminNotificationCenter: React.FC<AdminNotificationCenterProps> = ({
  onUnreadCountChange,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const rootRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef(new Set<string>());
  const unreadCountRef = useRef(0);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);

  const updateUnreadCount = useCallback(
    (count: number) => {
      const boundedCount = Math.max(0, count);
      unreadCountRef.current = boundedCount;
      setUnreadCount(boundedCount);
      onUnreadCountChange?.(boundedCount);
    },
    [onUnreadCountChange]
  );

  const refresh = useCallback(async () => {
    try {
      const response = await apiClient.get('/notifications?limit=8');
      const list: AdminNotification[] = response.data?.data || [];
      list.forEach((notification) => seenIds.current.add(notification._id));
      setNotifications(list);
      updateUnreadCount(response.data?.meta?.unreadCount || 0);
      setError('');
    } catch (requestError) {
      setError(extractApiErrorMessage(requestError, 'Could not load notifications.'));
    } finally {
      setLoading(false);
    }
  }, [updateUnreadCount]);

  useEffect(() => {
    void refresh();
    const stream = new EventSource('/api/v1/notifications/stream');
    stream.addEventListener('open', () => {
      setConnected(true);
      void refresh();
    });
    stream.addEventListener('notification', (event) => {
      try {
        const notification = JSON.parse((event as MessageEvent<string>).data) as AdminNotification;
        if (seenIds.current.has(notification._id)) return;
        seenIds.current.add(notification._id);
        setNotifications((current) => [notification, ...current].slice(0, 8));
        updateUnreadCount(unreadCountRef.current + (notification.isRead ? 0 : 1));
      } catch {
        setError('A live notification could not be processed. Refresh to synchronize.');
      }
    });
    stream.onerror = () => setConnected(false);

    const handleNotificationUpdate = () => void refresh();
    window.addEventListener('cms:notifications-updated', handleNotificationUpdate);
    return () => {
      stream.close();
      window.removeEventListener('cms:notifications-updated', handleNotificationUpdate);
    };
  }, [refresh, updateUnreadCount]);

  useEffect(() => {
    if (connected) return;
    const fallback = window.setInterval(() => void refresh(), 30000);
    return () => window.clearInterval(fallback);
  }, [connected, refresh]);

  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    void refresh();
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, refresh]);

  const handleSelect = async (notification: AdminNotification) => {
    if (!notification.isRead) {
      try {
        await apiClient.patch(`/notifications/${notification._id}/read`);
        setNotifications((current) =>
          current.map((item) =>
            item._id === notification._id ? { ...item, isRead: true } : item
          )
        );
        updateUnreadCount(unreadCount - 1);
        window.dispatchEvent(new Event('cms:notifications-updated'));
      } catch (requestError) {
        showToast(extractApiErrorMessage(requestError), 'error');
        return;
      }
    }
    setOpen(false);
    navigate(notification.targetUrl);
  };

  const markAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      updateUnreadCount(0);
      window.dispatchEvent(new Event('cms:notifications-updated'));
    } catch (requestError) {
      showToast(extractApiErrorMessage(requestError), 'error');
    }
  };

  const deleteNotification = async (notification: AdminNotification) => {
    try {
      await apiClient.delete(`/notifications/${notification._id}`);
      setNotifications((current) => current.filter((item) => item._id !== notification._id));
      if (!notification.isRead) updateUnreadCount(unreadCount - 1);
      window.dispatchEvent(new Event('cms:notifications-updated'));
    } catch (requestError) {
      showToast(extractApiErrorMessage(requestError), 'error');
    }
  };

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-white/12 bg-[#090E2C] text-[#E2E8F0] transition-colors hover:border-[#8B19FF] hover:text-white"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-[#030514] bg-rose-500 px-1 text-[9px] font-bold leading-none text-white animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.section
            role="dialog"
            aria-label="Notifications"
            initial={{ opacity: 0, y: -5, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.985 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 top-full z-50 mt-2 w-[min(24rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-[#8B19FF]/30 bg-[#070B24] shadow-[0_24px_70px_rgba(0,0,0,0.65)]"
          >
          <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] px-4 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-white">Notifications</h2>
              <p className="mt-0.5 text-[10px] text-[#B5BCD9]">
                {unreadCount} unread
                <span className="mx-1.5 text-white/20">·</span>
                <span className={connected ? 'text-emerald-300' : 'text-amber-300'}>
                  {connected ? 'Live' : 'Reconnecting'}
                </span>
              </p>
            </div>
            <button
              type="button"
              onClick={markAllRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-semibold text-[#00D9FF] hover:bg-white/[0.05] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Check className="h-3 w-3" />
              Mark all read
            </button>
          </div>

          <div className="max-h-[min(60vh,26rem)] overflow-y-auto">
            {loading ? (
              <div className="space-y-3 p-4" aria-label="Loading notifications">
                {[0, 1, 2].map((item) => (
                  <div key={item} className="flex gap-3 animate-pulse">
                    <span className="h-8 w-8 rounded-xl bg-white/[0.06]" />
                    <span className="flex-1 space-y-2 py-1">
                      <span className="block h-2.5 w-2/3 rounded bg-white/[0.07]" />
                      <span className="block h-2 w-full rounded bg-white/[0.05]" />
                    </span>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-5 text-center">
                <p className="text-xs text-rose-300">{error}</p>
                <button
                  type="button"
                  onClick={() => void refresh()}
                  className="mt-3 text-xs font-semibold text-[#00D9FF] hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center px-5 py-9 text-center">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/[0.04] text-[#B5BCD9]">
                  <Bell className="h-5 w-5" />
                </span>
                <p className="mt-3 text-xs font-semibold text-white">You’re all caught up</p>
                <p className="mt-1 text-[11px] text-[#B5BCD9]">
                  New admin notifications will appear here.
                </p>
              </div>
            ) : (
              notifications.map((notification) => (
                <NotificationRow
                  key={notification._id}
                  notification={notification}
                  onSelect={handleSelect}
                  onDelete={deleteNotification}
                />
              ))
            )}
          </div>

          <Link
            to="/admin/notifications"
            onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 border-t border-white/[0.08] px-4 py-3 text-[11px] font-bold text-[#00D9FF] transition-colors hover:bg-white/[0.04]"
          >
            View All Notifications
          </Link>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
};
