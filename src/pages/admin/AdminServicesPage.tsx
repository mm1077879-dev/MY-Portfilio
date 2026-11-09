import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save } from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { ServiceItem } from '../../types/portfolio';
import { parseDelimitedList, formatDelimitedList } from '../../utils/portfolioLogic';
import { DynamicIcon } from '../../components/common/DynamicIcon';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

const ICON_OPTIONS = [
  'ShoppingBag',
  'Globe',
  'Layers',
  'LayoutDashboard',
  'Gauge',
  'ShieldCheck',
  'Code2',
  'Zap',
  'Server',
  'Database',
];

const EMPTY_SERVICE = {
  title: '',
  icon: 'Code2',
  image: '',
  shortDescription: '',
  fullDescription: '',
  featuresRaw: 'Custom UI/UX, Responsive Layout, Admin CMS',
  deliverablesRaw: 'Production Web App, Source Code, Documentation',
  startingPrice: '$1,500',
  timelineEstimate: '2 – 4 Weeks',
  ctaText: 'Learn More',
  published: true,
};

export const AdminServicesPage: React.FC = () => {
  const { showToast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_SERVICE);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ServiceItem | null>(null);

  const loadServices = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/services?includeDrafts=true');
      setServices(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_SERVICE);
    setModalOpen(true);
  };

  const openEdit = (item: ServiceItem) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      icon: item.icon || 'Code2',
      image: item.image || '',
      shortDescription: item.shortDescription,
      fullDescription: item.fullDescription || '',
      featuresRaw: formatDelimitedList(item.features),
      deliverablesRaw: formatDelimitedList(item.deliverables),
      startingPrice: item.startingPrice || '',
      timelineEstimate: item.timelineEstimate || '',
      ctaText: item.ctaText || 'Learn More',
      published: item.published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      icon: form.icon,
      image: form.image.trim(),
      shortDescription: form.shortDescription.trim(),
      fullDescription: form.fullDescription.trim(),
      features: parseDelimitedList(form.featuresRaw),
      deliverables: parseDelimitedList(form.deliverablesRaw),
      startingPrice: form.startingPrice.trim(),
      timelineEstimate: form.timelineEstimate.trim(),
      ctaText: form.ctaText.trim() || 'Learn More',
      published: form.published,
    };

    try {
      if (editingId) {
        await apiClient.put(`/services/${editingId}`, payload);
        showToast('Service updated!', 'success');
      } else {
        await apiClient.post('/services', payload);
        showToast('Service created!', 'success');
      }
      setModalOpen(false);
      loadServices();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/services/${deleteTarget._id}`);
      showToast(`Deleted "${deleteTarget.title}"`, 'success');
      setDeleteTarget(null);
      loadServices();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Services
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Configure service offerings, pricing estimates, icons, and deliverables shown on the Homepage and Services page.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {loading ? (
        <div className="cosmic-card rounded-2xl p-8 text-center text-sm text-[#B5BCD9]">
          Loading services...
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((srv) => (
            <div
              key={srv._id}
              className="cosmic-card rounded-2xl p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-[#8B19FF]/20 border border-[#8B19FF]/35 flex items-center justify-center text-[#00D9FF]">
                    <DynamicIcon name={srv.icon} className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      srv.published ? 'text-[#00E69A]' : 'text-amber-400'
                    }`}
                  >
                    {srv.published ? 'Published' : 'Hidden'}
                  </span>
                </div>
                <h3 className="font-display font-bold text-lg text-white">
                  {srv.title}
                </h3>
                <p className="text-xs text-[#B5BCD9] leading-relaxed">
                  {srv.shortDescription}
                </p>
              </div>

              <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
                <span className="font-mono text-white tabular-nums">
                  {srv.startingPrice || 'Custom'}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openEdit(srv)}
                    aria-label={`Edit ${srv.title}`}
                    className="p-2 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] hover:bg-[#087BFF]/30 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(srv)}
                    aria-label={`Delete ${srv.title}`}
                    className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div className="w-full max-w-2xl rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">
                {editingId ? 'Edit Service' : 'Create Service'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close service modal"
                className="text-[#B5BCD9] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Service Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Icon
                  </label>
                  <select
                    value={form.icon}
                    onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                  >
                    {ICON_OPTIONS.map((ic) => (
                      <option key={ic} value={ic}>
                        {ic}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Short Summary *
                </label>
                <input
                  type="text"
                  required
                  value={form.shortDescription}
                  onChange={(e) =>
                    setForm({ ...form, shortDescription: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Full Modal Description
                </label>
                <textarea
                  rows={3}
                  value={form.fullDescription}
                  onChange={(e) =>
                    setForm({ ...form, fullDescription: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <ImageUploaderField
                label="Service Showcase Image (Optional)"
                value={form.image}
                onChange={(url) => setForm({ ...form, image: url })}
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Starting Price
                  </label>
                  <input
                    type="text"
                    value={form.startingPrice}
                    onChange={(e) => setForm({ ...form, startingPrice: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Timeline Estimate
                  </label>
                  <input
                    type="text"
                    value={form.timelineEstimate}
                    onChange={(e) =>
                      setForm({ ...form, timelineEstimate: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Included Features (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.featuresRaw}
                  onChange={(e) => setForm({ ...form, featuresRaw: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Deliverables (comma-separated)
                </label>
                <input
                  type="text"
                  value={form.deliverablesRaw}
                  onChange={(e) => setForm({ ...form, deliverablesRaw: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-[#00E69A]"
                />
                <span>Visible on Public Website</span>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-[#B5BCD9] bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Service'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Service?"
        description={`Remove "${deleteTarget?.title}" permanently from MongoDB?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
