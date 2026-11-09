import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  FolderKanban,
  Mail,
  Users,
  Star,
  Plus,
  Sparkles,
  Settings,
  ArrowRight,
  Database,
  HardDrive,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { AnalyticsOverviewData } from '../../types/portfolio';

const DATE_RANGES = [
  { label: '7 Days', value: 7 },
  { label: '14 Days', value: 14 },
  { label: '30 Days', value: 30 },
  { label: '90 Days', value: 90 },
];

export const AdminOverviewPage: React.FC = () => {
  const { admin } = useAuth();
  const { showToast } = useToast();
  const [days, setDays] = useState<number>(14);
  const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadOverview = useCallback(
    async (selectedDays: number) => {
      setLoading(true);
      try {
        const res = await apiClient.get(`/analytics/overview?days=${selectedDays}`);
        setOverview(res.data.data);
      } catch (err) {
        showToast(extractApiErrorMessage(err, 'Failed to load dashboard overview.'), 'error');
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    loadOverview(days);
  }, [days, loadOverview]);

  const cards = overview?.cards;
  const sys = overview?.systemStatus;

  return (
    <div className="space-y-6">
      {/* Welcome Banner matching Admin Dashboard Reference */}
      <div className="rounded-3xl bg-gradient-to-r from-[#1A1046] via-[#0D153D] to-[#090E2C] border border-[#8B19FF]/40 p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-[0_18px_50px_-15px_rgba(139,25,255,0.35)]">
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#00D9FF]">
            Portfolio Administration Console
          </p>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Welcome back, {admin?.name || 'Mahim Dev'}
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9]">
            Monitor real MongoDB portfolio metrics, respond to client inquiries, and publish live updates.
          </p>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-2">
          {DATE_RANGES.map((range) => (
            <button
              key={range.value}
              type="button"
              onClick={() => setDays(range.value)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                days === range.value
                  ? 'btn-neon-primary text-white'
                  : 'bg-[#05081D]/80 border border-white/12 text-[#B5BCD9] hover:text-white'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4 Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <div className="cosmic-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#B5BCD9]">Total Projects</span>
            <div className="w-9 h-9 rounded-xl bg-[#8B19FF]/20 border border-[#8B19FF]/35 flex items-center justify-center text-[#A855F7]">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-white tabular-nums">
            {loading ? '—' : cards?.totalProjects ?? 0}
          </div>
          <div className="text-xs text-[#00E69A] tabular-nums">
            {cards?.publishedProjects ?? 0} published live
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#B5BCD9]">Total Messages</span>
            <div className="w-9 h-9 rounded-xl bg-[#087BFF]/20 border border-[#087BFF]/35 flex items-center justify-center text-[#00D9FF]">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-white tabular-nums">
            {loading ? '—' : cards?.totalMessages ?? 0}
          </div>
          <div className="text-xs text-amber-400 tabular-nums">
            {cards?.unreadMessages ?? 0} unread inquiries
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#B5BCD9]">
              Visitors ({days}d)
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#00E69A]/15 border border-[#00E69A]/35 flex items-center justify-center text-[#00E69A]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-white tabular-nums">
            {loading ? '—' : cards?.totalVisitors ?? 0}
          </div>
          <div className="text-xs text-[#B5BCD9] tabular-nums">
            {cards?.totalPageViews ?? 0} recorded page views
          </div>
        </div>

        <div className="cosmic-card rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-[#B5BCD9]">Client Rating</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-400/35 flex items-center justify-center text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
          </div>
          <div className="font-display font-extrabold text-3xl text-white tabular-nums">
            {loading ? '—' : (cards?.clientRating ?? 5.0).toFixed(1)}
          </div>
          <div className="text-xs text-[#B5BCD9]">
            Computed from published reviews
          </div>
        </div>
      </div>

      {/* Website Overview Chart + Quick Actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 cosmic-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                Website Overview
              </h2>
              <p className="text-xs text-[#B5BCD9]">
                Daily page views, unique visitors, and contact inquiries over the last {days} days
              </p>
            </div>
            <Link
              to="/admin/analytics"
              className="text-xs font-semibold text-[#00D9FF] hover:underline"
            >
              Detailed Analytics →
            </Link>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={overview?.chartSeries || []}
                margin={{ top: 10, right: 10, left: -18, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="gradViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B19FF" stopOpacity={0.55} />
                    <stop offset="95%" stopColor="#8B19FF" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="gradVisitors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D9FF" stopOpacity={0.45} />
                    <stop offset="95%" stopColor="#00D9FF" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                <XAxis
                  dataKey="label"
                  tick={{ fill: '#B5BCD9', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#B5BCD9', fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#090E2C',
                    borderColor: 'rgba(139, 25, 255, 0.45)',
                    borderRadius: '12px',
                    fontSize: '12px',
                    color: '#F5F5FF',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="pageViews"
                  name="Page Views"
                  stroke="#8B19FF"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#gradViews)"
                  isAnimationActive={false}
                />
                <Area
                  type="monotone"
                  dataKey="visitors"
                  name="Unique Visitors"
                  stroke="#00D9FF"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#gradVisitors)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div className="xl:col-span-4 cosmic-card rounded-2xl p-5 sm:p-6 flex flex-col justify-between gap-4">
          <div className="space-y-3">
            <h2 className="font-display font-bold text-lg text-white">
              Quick Actions
            </h2>
            <p className="text-xs text-[#B5BCD9]">
              Jump directly to common CMS publishing tasks.
            </p>

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              <Link
                to="/admin/projects"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#05081D] border border-white/10 hover:border-[#8B19FF] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-white">
                  <Plus className="w-4 h-4 text-[#00E69A]" />
                  <span>Add or Edit Projects</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#B5BCD9]" />
              </Link>

              <Link
                to="/admin/banner"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#05081D] border border-white/10 hover:border-[#8B19FF] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-white">
                  <Sparkles className="w-4 h-4 text-[#A855F7]" />
                  <span>Update Hero Banner</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#B5BCD9]" />
              </Link>

              <Link
                to="/admin/messages"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#05081D] border border-white/10 hover:border-[#8B19FF] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-white">
                  <Mail className="w-4 h-4 text-[#00D9FF]" />
                  <span>Review Client Inbox</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#B5BCD9]" />
              </Link>

              <Link
                to="/admin/settings"
                className="flex items-center justify-between p-3.5 rounded-xl bg-[#05081D] border border-white/10 hover:border-[#8B19FF] transition-colors"
              >
                <span className="flex items-center gap-2.5 text-xs font-semibold text-white">
                  <Settings className="w-4 h-4 text-amber-400" />
                  <span>Configure Site &amp; SEO</span>
                </span>
                <ArrowRight className="w-4 h-4 text-[#B5BCD9]" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom 3 Panels: Recent Messages, Top Projects, System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-6">
        {/* Recent Messages */}
        <div className="xl:col-span-5 md:col-span-1 cosmic-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">
              Recent Messages
            </h2>
            <Link
              to="/admin/messages"
              className="text-xs font-semibold text-[#00D9FF] hover:underline"
            >
              Open Inbox →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.07]">
            {(overview?.recentMessages || []).length === 0 ? (
              <p className="text-xs text-[#B5BCD9] py-4">No inquiries received yet.</p>
            ) : (
              overview?.recentMessages.map((msg) => (
                <Link
                  key={msg._id}
                  to={`/admin/messages?selected=${msg._id}`}
                  className="block py-3 hover:bg-white/[0.02] transition-colors space-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-white truncate">
                      {msg.fullName}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
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
                  <p className="text-xs text-[#E2E8F0] truncate">{msg.subject}</p>
                  <p className="text-[11px] text-[#B5BCD9]/75 truncate">{msg.email}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Top Projects */}
        <div className="xl:col-span-4 md:col-span-1 cosmic-card rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-white">
              Top Projects
            </h2>
            <Link
              to="/admin/projects"
              className="text-xs font-semibold text-[#00D9FF] hover:underline"
            >
              Manage →
            </Link>
          </div>

          <div className="divide-y divide-white/[0.07]">
            {(overview?.topProjects || []).map((proj) => (
              <div
                key={proj._id}
                className="py-3 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-white truncate">
                    {proj.title}
                  </div>
                  <div className="text-[11px] text-[#B5BCD9]">{proj.category}</div>
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-mono text-[#00D9FF] tabular-nums shrink-0">
                  <Eye className="w-3.5 h-3.5" />
                  <span>{proj.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="xl:col-span-3 md:col-span-2 xl:col-span-3 cosmic-card rounded-2xl p-5 sm:p-6 space-y-4">
          <h2 className="font-display font-bold text-lg text-white">
            System Status
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-[#05081D] border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[#B5BCD9]">
                <span className="flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-[#00E69A]" />
                  <span>MongoDB</span>
                </span>
                <span className="font-semibold text-[#00E69A]">
                  {sys?.database.connected ? 'Connected' : 'Offline'}
                </span>
              </div>
              <div className="text-[11px] text-[#B5BCD9]/75">
                Mode: {sys?.database.mode || 'checking'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05081D] border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[#B5BCD9]">
                <span className="flex items-center gap-1.5">
                  <HardDrive className="w-3.5 h-3.5 text-[#00D9FF]" />
                  <span>Media Storage</span>
                </span>
                <span className="font-mono text-white tabular-nums">
                  {sys?.storage.storedAssetsCount ?? 0} files
                </span>
              </div>
              <div className="text-[11px] text-[#B5BCD9]/75">
                {sys?.storage.provider || 'Local /uploads'}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#05081D] border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[#B5BCD9]">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A855F7]" />
                  <span>Outbound Email</span>
                </span>
                <span
                  className={
                    sys?.email.smtpConfigured ? 'text-[#00E69A]' : 'text-amber-400'
                  }
                >
                  {sys?.email.smtpConfigured ? 'SMTP Active' : 'DB Inbox Only'}
                </span>
              </div>
              <div className="text-[11px] text-[#B5BCD9]/75 leading-snug">
                {sys?.email.statusLabel}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
