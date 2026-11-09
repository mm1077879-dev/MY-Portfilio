import React, { useEffect, useState } from 'react';
import {
  Mail,
  Search,
  Trash2,
  Download,
  Users,
  UserCheck,
  UserX,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import type { NewsletterSubscriberItem } from '../../types/portfolio';

export const AdminNewsletterPage: React.FC = () => {
  const { showToast } = useToast();
  const [subscribers, setSubscribers] = useState<NewsletterSubscriberItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({ total: 0, activeCount: 0, unsubscribedCount: 0 });
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSubscribers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/newsletter', {
        params: { search: search || undefined, limit: 100 },
      });
      if (res.data?.success) {
        setSubscribers(res.data.data || []);
        if (res.data.meta) {
          setCounts({
            total: res.data.meta.total || 0,
            activeCount: res.data.meta.activeCount || 0,
            unsubscribedCount: res.data.meta.unsubscribedCount || 0,
          });
        }
      }
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to load newsletter subscribers.'), 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, [search]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/newsletter/${deleteId}`);
      showToast('Subscriber removed successfully!', 'success');
      setDeleteId(null);
      await fetchSubscribers();
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to delete subscriber.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showToast('No subscribers available to export.', 'info');
      return;
    }

    const headers = ['Email', 'Status', 'Source', 'Subscribed At'];
    const rows = subscribers.map((s) => [
      `"${s.email}"`,
      s.status,
      s.source || 'footer_subscription',
      s.createdAt ? new Date(s.createdAt).toISOString() : '',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `newsletter_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Subscribers exported to CSV successfully!', 'success');
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2.5">
            <Mail className="w-7 h-7 text-[#00D9FF]" />
            <span>Newsletter Subscribers</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Real subscribers captured through the footer subscription form stored persistently in MongoDB.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchSubscribers}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-[#090E2C] border border-white/15 text-xs font-semibold text-[#B5BCD9] hover:text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="btn-neon-primary px-4 py-2 rounded-xl text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="cosmic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#8B19FF]/20 border border-[#8B19FF]/40 flex items-center justify-center text-[#8B19FF]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white">{counts.total}</div>
            <div className="text-xs text-[#B5BCD9]">Total Subscribers</div>
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#00E69A]/20 border border-[#00E69A]/40 flex items-center justify-center text-[#00E69A]">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white">{counts.activeCount}</div>
            <div className="text-xs text-[#B5BCD9]">Active Subscriptions</div>
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
            <UserX className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-display font-bold text-white">{counts.unsubscribedCount}</div>
            <div className="text-xs text-[#B5BCD9]">Unsubscribed / Inactive</div>
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B5BCD9]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by email..."
          className="w-full rounded-xl bg-[#05081D] border border-white/15 pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-[#B5BCD9]/50 focus:outline-none focus:border-[#8B19FF]"
        />
      </div>

      {/* Subscribers Table */}
      <div className="cosmic-card rounded-3xl overflow-hidden border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#F5F5FF]">
            <thead className="bg-[#05081D] text-xs font-semibold text-[#B5BCD9] uppercase tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-6">Subscriber Email</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6">Source</th>
                <th className="py-3.5 px-6">Subscribed Date</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#B5BCD9]">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin text-[#8B19FF]" />
                      <span>Loading subscribers from database...</span>
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#B5BCD9]">
                    No subscribers found matching the current search.
                  </td>
                </tr>
              ) : (
                subscribers.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6 font-mono text-xs font-medium text-white">
                      {item.email}
                    </td>
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          item.status === 'active'
                            ? 'bg-[#00E69A]/15 text-[#00E69A] border border-[#00E69A]/30'
                            : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {item.status === 'active' ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-[#B5BCD9]">
                      {item.source || 'footer_subscription'}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#B5BCD9] font-mono">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteId(item._id)}
                        aria-label="Delete subscriber"
                        className="p-1.5 rounded-lg border border-rose-500/30 text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteId)}
        title="Delete Newsletter Subscriber"
        message="Are you sure you want to permanently delete this subscriber from the database? This action cannot be undone."
        confirmLabel={deleting ? 'Deleting...' : 'Delete Subscriber'}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteId(null)}
      />
    </div>
  );
};
