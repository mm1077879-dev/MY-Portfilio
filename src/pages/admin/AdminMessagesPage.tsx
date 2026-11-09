import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  MailOpen,
  Mail,
  Archive,
  Trash2,
  Send,
  Clock,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { ContactMessageItem, MessageStatus } from '../../types/portfolio';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const STATUS_TABS = ['All', 'New', 'Read', 'Replied', 'Archived'] as const;

interface AdminMessagesPageProps {
  defaultStatusFilter?: string;
  pageTitle?: string;
}

export const AdminMessagesPage: React.FC<AdminMessagesPageProps> = ({
  defaultStatusFilter = 'All',
  pageTitle = 'Messages & Contact Inquiries',
}) => {
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [messages, setMessages] = useState<ContactMessageItem[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [statusFilter, setStatusFilter] = useState<string>(defaultStatusFilter);
  const [search, setSearch] = useState<string>('');
  const [selected, setSelected] = useState<ContactMessageItem | null>(null);
  const [replyText, setReplyText] = useState<string>('');
  const [sendEmail, setSendEmail] = useState<boolean>(false);
  const [sendingReply, setSendingReply] = useState<boolean>(false);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const syncCounts = useCallback((nextCounts?: Record<string, number>) => {
    if (!nextCounts) return;
    setCounts(nextCounts);
    window.dispatchEvent(new CustomEvent('cms:messages-updated', { detail: nextCounts }));
  }, []);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== 'All') q.set('status', statusFilter);
      if (search.trim()) q.set('search', search.trim());
      const res = await apiClient.get(`/messages?${q.toString()}`);
      const list: ContactMessageItem[] = res.data?.data || [];
      setMessages(list);
      syncCounts(res.data?.meta?.counts || {});

      const preselectId = searchParams.get('selected');
      if (preselectId) {
        const found = list.find((m) => m._id === preselectId);
        if (found) setSelected(found);
      } else if (list.length > 0 && !selected) {
        setSelected(list[0]);
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, searchParams, selected, showToast, syncCounts]);

  useEffect(() => {
    setStatusFilter(defaultStatusFilter);
  }, [defaultStatusFilter]);

  useEffect(() => {
    loadInbox();
  }, [statusFilter]);

  const handleSelectMessage = async (msg: ContactMessageItem) => {
    setSelected(msg);
    setReplyText(msg.replyBody || '');
    if (msg.status === 'New') {
      try {
        const res = await apiClient.put(`/messages/${msg._id}`, { status: 'Read' });
        const updated = res.data.data;
        setMessages((prev) => prev.map((m) => (m._id === msg._id ? updated : m)));
        setSelected(updated);
        syncCounts(res.data?.meta?.counts);
      } catch {
        // Ignore transient status update error
      }
    }
  };

  const handleChangeStatus = async (msg: ContactMessageItem, status: MessageStatus) => {
    try {
      const res = await apiClient.put(`/messages/${msg._id}`, { status });
      const updated = res.data.data;
      setMessages((prev) => prev.map((m) => (m._id === msg._id ? updated : m)));
      setSelected(updated);
      syncCounts(res.data?.meta?.counts);
      showToast(`Marked inquiry as ${status}`, 'info');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected || !replyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await apiClient.put(`/messages/${selected._id}`, {
        replyBody: replyText.trim(),
        sendEmailReply: sendEmail,
      });
      const updated = res.data.data;
      const note = res.data?.meta?.emailDeliveryNote;
      setMessages((prev) => prev.map((m) => (m._id === selected._id ? updated : m)));
      setSelected(updated);
      syncCounts(res.data?.meta?.counts);
      showToast(note || 'Reply recorded in inbox.', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSendingReply(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/messages/${deleteTarget._id}`);
      showToast('Inquiry deleted.', 'success');
      if (selected?._id === deleteTarget._id) {
        setSelected(null);
      }
      setDeleteTarget(null);
      loadInbox();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            {pageTitle}
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Review, search, archive, and respond to public contact form submissions stored in MongoDB.
          </p>
        </div>
        <div className="text-xs font-mono text-[#00E69A] tabular-nums">
          {counts.unread ?? 0} Unread New Messages
        </div>
      </div>

      {/* Filter Tabs + Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#070B24] border border-white/10 rounded-2xl p-3">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setStatusFilter(tab)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === tab
                  ? 'btn-neon-primary text-white'
                  : 'bg-[#090E2C] text-[#B5BCD9] hover:text-white'
              }`}
            >
              <span>{tab}</span>
              {tab !== 'All' && counts[tab] !== undefined && (
                <span className="ml-1.5 font-mono opacity-80">({counts[tab]})</span>
              )}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadInbox();
          }}
          className="relative w-full md:w-72"
        >
          <Search className="w-4 h-4 text-[#B5BCD9] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search sender or subject..."
            aria-label="Search messages"
            className="w-full rounded-xl bg-[#05081D] border border-white/15 pl-9 pr-3 py-2 text-xs text-white"
          />
        </form>
      </div>

      {/* Split Inbox View */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left List */}
        <div className="lg:col-span-5 cosmic-card rounded-2xl divide-y divide-white/[0.07] max-h-[620px] overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center text-xs text-[#B5BCD9]">
              Loading messages...
            </div>
          ) : messages.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#B5BCD9]">
              No inquiries match the selected filter.
            </div>
          ) : (
            messages.map((msg) => {
              const isSelected = selected?._id === msg._id;
              return (
                <button
                  key={msg._id}
                  type="button"
                  onClick={() => handleSelectMessage(msg)}
                  className={`w-full text-left p-4 transition-colors cursor-pointer space-y-1 ${
                    isSelected ? 'bg-[#8B19FF]/18' : 'hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs sm:text-sm text-white truncate">
                      {msg.fullName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold shrink-0 ${
                        msg.status === 'New'
                          ? 'text-[#00E69A]'
                          : msg.status === 'Replied'
                            ? 'text-[#00D9FF]'
                            : 'text-[#B5BCD9]'
                      }`}
                    >
                      {msg.status}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-[#E2E8F0] truncate">
                    {msg.subject}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#B5BCD9]/75">
                    <span className="truncate">{msg.service}</span>
                    <span className="font-mono tabular-nums">
                      {new Date(msg.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Right Detail Reader & Reply Composer */}
        <div className="lg:col-span-7 cosmic-card rounded-2xl p-6">
          {!selected ? (
            <div className="py-16 text-center text-sm text-[#B5BCD9]">
              Select a message from the inbox list to inspect details.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <h2 className="font-display font-bold text-xl text-white">
                    {selected.subject}
                  </h2>
                  <p className="text-xs text-[#B5BCD9]">
                    From <strong className="text-white">{selected.fullName}</strong> (
                    <a
                      href={`mailto:${selected.email}`}
                      className="text-[#00D9FF] hover:underline"
                    >
                      {selected.email}
                    </a>
                    ) · Service: <span className="text-white">{selected.service}</span>
                  </p>
                  <p className="text-[11px] text-[#B5BCD9]/75 flex items-center gap-1 font-mono tabular-nums">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(selected.createdAt).toLocaleString()}</span>
                  </p>
                </div>

                {/* Status Action Controls */}
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      handleChangeStatus(
                        selected,
                        selected.status === 'New' ? 'Read' : 'New'
                      )
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-white cursor-pointer"
                  >
                    {selected.status === 'New' ? (
                      <>
                        <MailOpen className="w-3.5 h-3.5 text-[#00D9FF]" />
                        <span>Mark Read</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-3.5 h-3.5 text-[#00E69A]" />
                        <span>Mark Unread</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleChangeStatus(selected, 'Archived')}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-[#B5BCD9] cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    <span>Archive</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(selected)}
                    aria-label="Delete message"
                    className="p-2 rounded-xl bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Message Body */}
              <div className="rounded-2xl bg-[#05081D] border border-white/10 p-4 text-sm text-[#E2E8F0] whitespace-pre-wrap leading-relaxed">
                {selected.message}
              </div>

              {/* Reply Form */}
              <form onSubmit={handleReplySubmit} className="space-y-3 pt-2 border-t border-white/10">
                <label className="block text-xs font-semibold text-white">
                  Record Response / Reply Note
                </label>
                <textarea
                  rows={4}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your response to save in inbox history (and optionally deliver via SMTP if configured)..."
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-xs sm:text-sm text-white"
                />

                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-xs text-[#B5BCD9] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendEmail}
                      onChange={(e) => setSendEmail(e.target.checked)}
                      className="w-4 h-4 accent-[#8B19FF]"
                    />
                    <span>Attempt outbound SMTP delivery (requires EMAIL_SERVICE_* env)</span>
                  </label>

                  <button
                    type="submit"
                    disabled={sendingReply || !replyText.trim()}
                    className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{sendingReply ? 'Saving...' : 'Save Reply'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Message?"
        description={`Permanently delete inquiry from "${deleteTarget?.fullName}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
