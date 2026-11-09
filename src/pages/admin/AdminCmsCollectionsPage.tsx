import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Pencil, Trash2, X, Save, Star } from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type {
  TestimonialItem,
  SkillItem,
  PricingPackageItem,
  FAQItem,
} from '../../types/portfolio';
import { parseDelimitedList, formatDelimitedList } from '../../utils/portfolioLogic';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

// ============================================================================
// 1. MANAGE TESTIMONIALS
// ============================================================================
export const AdminTestimonialsPage: React.FC = () => {
  const { showToast } = useToast();
  const [items, setItems] = useState<TestimonialItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TestimonialItem | null>(null);
  const [form, setForm] = useState({
    clientName: '',
    clientImage: '',
    company: '',
    position: '',
    review: '',
    rating: 5,
    featured: true,
    published: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/testimonials?includeDrafts=true');
      setItems(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      clientName: '',
      clientImage: '',
      company: '',
      position: '',
      review: '',
      rating: 5,
      featured: true,
      published: true,
    });
    setModalOpen(true);
  };

  const openEdit = (t: TestimonialItem) => {
    setEditingId(t._id);
    setForm({
      clientName: t.clientName,
      clientImage: t.clientImage || '',
      company: t.company,
      position: t.position,
      review: t.review,
      rating: t.rating,
      featured: t.featured,
      published: t.published,
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/testimonials/${editingId}`, form);
        showToast('Testimonial updated!', 'success');
      } else {
        await apiClient.post('/testimonials', form);
        showToast('Testimonial created!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/testimonials/${deleteTarget._id}`);
      showToast('Testimonial deleted.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Testimonials
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Add, edit, or unpublish client reviews displayed on the Homepage.
          </p>
        </div>
        <button
          type="button"
          onClick={openNew}
          className="btn-neon-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Review</span>
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {items.map((item) => (
          <div key={item._id} className="cosmic-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base text-white">
                  {item.clientName}
                </h3>
                <p className="text-xs text-[#B5BCD9]">
                  {item.position} · {item.company}
                </p>
              </div>
              <div className="flex items-center gap-1 text-amber-400 text-xs font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                <span>{item.rating}.0</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-[#E2E8F0] italic leading-relaxed">
              &ldquo;{item.review}&rdquo;
            </p>
            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className={item.published ? 'text-[#00E69A]' : 'text-amber-400'}>
                {item.published ? 'Published' : 'Draft'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(item)}
                  aria-label={`Edit review by ${item.clientName}`}
                  className="p-2 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Delete review by ${item.clientName}`}
                  className="p-2 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-xl rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">
                {editingId ? 'Edit Testimonial' : 'Add Testimonial'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="text-[#B5BCD9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Client Name *</label>
                  <input
                    type="text"
                    required
                    value={form.clientName}
                    onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Position *</label>
                  <input
                    type="text"
                    required
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Company *</label>
                  <input
                    type="text"
                    required
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Rating (1–5)</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={form.rating}
                    onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <ImageUploaderField
                label="Client Avatar (Optional)"
                value={form.clientImage}
                onChange={(url) => setForm({ ...form, clientImage: url })}
              />
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Review Text *</label>
                <textarea
                  rows={3}
                  required
                  value={form.review}
                  onChange={(e) => setForm({ ...form, review: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  className="w-4 h-4 accent-[#00E69A]"
                />
                <span>Published</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#B5BCD9] bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="btn-neon-primary inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer">
                  <Save className="w-3.5 h-3.5" />
                  <span>Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Testimonial?"
        description={`Delete review by "${deleteTarget?.clientName}"?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

// ============================================================================
// 2. MANAGE SKILLS
// ============================================================================
export const AdminSkillsPage: React.FC = () => {
  const { showToast } = useToast();
  const [skills, setSkills] = useState<SkillItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SkillItem | null>(null);
  const [form, setForm] = useState({
    name: '',
    category: 'Frontend' as SkillItem['category'],
    icon: 'Code2',
    proficiency: 90,
    description: '',
    order: 1,
    visible: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/skills?includeDrafts=true');
      setSkills(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      name: '',
      category: 'Frontend',
      icon: 'Code2',
      proficiency: 90,
      description: '',
      order: skills.length + 1,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEdit = (s: SkillItem) => {
    setEditingId(s._id);
    setForm({
      name: s.name,
      category: s.category,
      icon: s.icon,
      proficiency: s.proficiency,
      description: s.description || '',
      order: s.order,
      visible: s.visible,
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/skills/${editingId}`, form);
        showToast('Skill updated!', 'success');
      } else {
        await apiClient.post('/skills', form);
        showToast('Skill added!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/skills/${deleteTarget._id}`);
      showToast('Skill removed.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Technical Skills
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Configure technical stack cards, categories, and proficiency levels on the About page.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-neon-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Skill</span>
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((s) => (
          <div key={s._id} className="cosmic-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-display font-bold text-white text-base">{s.name}</span>
              <span className="font-mono text-xs text-[#00E69A] tabular-nums">{s.proficiency}%</span>
            </div>
            <p className="text-xs text-[#00D9FF]">{s.category}</p>
            <p className="text-xs text-[#B5BCD9]">{s.description}</p>
            <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <span className={s.visible ? 'text-[#00E69A]' : 'text-amber-400'}>
                {s.visible ? 'Visible' : 'Hidden'}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(s)} aria-label={`Edit ${s.name}`} className="p-1.5 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setDeleteTarget(s)} aria-label={`Delete ${s.name}`} className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-lg rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">
                {editingId ? 'Edit Skill' : 'Add Skill'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="text-[#B5BCD9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as SkillItem['category'] })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  >
                    <option value="Frontend">Frontend</option>
                    <option value="Backend">Backend</option>
                    <option value="Database">Database</option>
                    <option value="DevOps & Tools">DevOps &amp; Tools</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Proficiency ({form.proficiency}%)
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={form.proficiency}
                    onChange={(e) => setForm({ ...form, proficiency: Number(e.target.value) })}
                    className="w-full accent-[#8B19FF]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Display Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Short Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="w-4 h-4 accent-[#00E69A]"
                />
                <span>Visible on Public Site</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#B5BCD9] bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer">
                  Save Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Skill?"
        description={`Delete "${deleteTarget?.name}" from MongoDB?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

// ============================================================================
// 3. MANAGE PRICING
// ============================================================================
export const AdminPricingPage: React.FC = () => {
  const { showToast } = useToast();
  const [packages, setPackages] = useState<PricingPackageItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PricingPackageItem | null>(null);
  const [form, setForm] = useState({
    packageName: '',
    audienceLabel: 'For growing businesses',
    price: '$1,500',
    billingType: 'One-Time' as PricingPackageItem['billingType'],
    description: '',
    featuresRaw: 'Custom UI, Express API, MongoDB Setup',
    ctaText: 'Get Started',
    ctaLink: '/contact',
    featured: false,
    visible: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/pricing?includeDrafts=true');
      setPackages(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      packageName: '',
      audienceLabel: 'For growing businesses',
      price: '$1,500',
      billingType: 'One-Time',
      description: '',
      featuresRaw: 'Custom UI, Express API, MongoDB Setup',
      ctaText: 'Get Started',
      ctaLink: '/contact',
      featured: false,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEdit = (p: PricingPackageItem) => {
    setEditingId(p._id);
    setForm({
      packageName: p.packageName,
      audienceLabel: p.audienceLabel || '',
      price: p.price,
      billingType: p.billingType,
      description: p.description || '',
      featuresRaw: formatDelimitedList(p.features),
      ctaText: p.ctaText || 'Get Started',
      ctaLink: p.ctaLink || '/contact',
      featured: p.featured,
      visible: p.visible,
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      packageName: form.packageName,
      audienceLabel: form.audienceLabel,
      price: form.price,
      billingType: form.billingType,
      description: form.description,
      features: parseDelimitedList(form.featuresRaw),
      ctaText: form.ctaText,
      ctaLink: form.ctaLink,
      featured: form.featured,
      visible: form.visible,
    };
    try {
      if (editingId) {
        await apiClient.put(`/pricing/${editingId}`, payload);
        showToast('Pricing package updated!', 'success');
      } else {
        await apiClient.post('/pricing', payload);
        showToast('Pricing package added!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/pricing/${deleteTarget._id}`);
      showToast('Package deleted.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Pricing Packages
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Control investment tiers and deliverables shown on the Services page.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-neon-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Package</span>
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-5">
        {packages.map((pkg) => (
          <div key={pkg._id} className="cosmic-card rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#00D9FF]">{pkg.billingType}</span>
                {pkg.featured && <span className="text-[#00E69A] font-bold">Featured</span>}
              </div>
              <h3 className="font-display font-bold text-xl text-white">{pkg.packageName}</h3>
              <div className="font-display font-extrabold text-2xl text-white tabular-nums">
                {pkg.price}
              </div>
              <p className="text-xs text-[#B5BCD9]">{pkg.description}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-white/10 text-xs">
              <span className={pkg.visible ? 'text-[#00E69A]' : 'text-amber-400'}>
                {pkg.visible ? 'Visible' : 'Hidden'}
              </span>
              <div className="flex gap-2">
                <button type="button" onClick={() => openEdit(pkg)} aria-label={`Edit ${pkg.packageName}`} className="p-1.5 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] cursor-pointer">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => setDeleteTarget(pkg)} aria-label={`Delete ${pkg.packageName}`} className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-xl rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">
                {editingId ? 'Edit Package' : 'Add Package'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="text-[#B5BCD9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-3.5">
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Package Name *</label>
                  <input
                    type="text"
                    required
                    value={form.packageName}
                    onChange={(e) => setForm({ ...form, packageName: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Price *</label>
                  <input
                    type="text"
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Audience Label</label>
                  <input
                    type="text"
                    value={form.audienceLabel}
                    onChange={(e) => setForm({ ...form, audienceLabel: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Billing Type</label>
                  <select
                    value={form.billingType}
                    onChange={(e) =>
                      setForm({ ...form, billingType: e.target.value as PricingPackageItem['billingType'] })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  >
                    <option value="One-Time">One-Time</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Description</label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Features (comma-separated)</label>
                <textarea
                  rows={3}
                  value={form.featuresRaw}
                  onChange={(e) => setForm({ ...form, featuresRaw: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex gap-6">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#8B19FF]"
                  />
                  <span>Featured Tier</span>
                </label>
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.visible}
                    onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                    className="w-4 h-4 accent-[#00E69A]"
                  />
                  <span>Visible</span>
                </label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#B5BCD9] bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer">
                  Save Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Pricing Package?"
        description={`Remove "${deleteTarget?.packageName}" permanently?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};

// ============================================================================
// 4. MANAGE FAQ
// ============================================================================
export const AdminFaqPage: React.FC = () => {
  const { showToast } = useToast();
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FAQItem | null>(null);
  const [form, setForm] = useState({
    question: '',
    answer: '',
    category: 'General',
    order: 1,
    visible: true,
  });

  const load = useCallback(async () => {
    try {
      const res = await apiClient.get('/faq?includeDrafts=true');
      setFaqs(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const openNew = () => {
    setEditingId(null);
    setForm({
      question: '',
      answer: '',
      category: 'General',
      order: faqs.length + 1,
      visible: true,
    });
    setModalOpen(true);
  };

  const openEdit = (f: FAQItem) => {
    setEditingId(f._id);
    setForm({
      question: f.question,
      answer: f.answer,
      category: f.category,
      order: f.order,
      visible: f.visible,
    });
    setModalOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await apiClient.put(`/faq/${editingId}`, form);
        showToast('FAQ updated!', 'success');
      } else {
        await apiClient.post('/faq', form);
        showToast('FAQ added!', 'success');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const remove = async () => {
    if (!deleteTarget) return;
    try {
      await apiClient.delete(`/faq/${deleteTarget._id}`);
      showToast('FAQ deleted.', 'success');
      setDeleteTarget(null);
      load();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Frequently Asked Questions
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Edit FAQ accordion items shown on the Contact page.
          </p>
        </div>
        <button type="button" onClick={openNew} className="btn-neon-primary inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white cursor-pointer">
          <Plus className="w-4 h-4" />
          <span>Add Question</span>
        </button>
      </div>

      <div className="space-y-3.5">
        {faqs.map((faq) => (
          <div key={faq._id} className="cosmic-card rounded-2xl p-5 flex items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-[#00D9FF] font-semibold">{faq.category}</span>
                <span>·</span>
                <span className={faq.visible ? 'text-[#00E69A]' : 'text-amber-400'}>
                  {faq.visible ? 'Visible' : 'Hidden'}
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-white">{faq.question}</h3>
              <p className="text-xs sm:text-sm text-[#B5BCD9]">{faq.answer}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={() => openEdit(faq)} aria-label={`Edit ${faq.question}`} className="p-2 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] cursor-pointer">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button type="button" onClick={() => setDeleteTarget(faq)} aria-label={`Delete ${faq.question}`} className="p-2 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {modalOpen && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="w-full max-w-lg rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">
                {editingId ? 'Edit FAQ' : 'Add FAQ'}
              </h2>
              <button type="button" onClick={() => setModalOpen(false)} aria-label="Close" className="text-[#B5BCD9]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={save} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Question *</label>
                <input
                  type="text"
                  required
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Answer *</label>
                <textarea
                  rows={4}
                  required
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">Order</label>
                  <input
                    type="number"
                    value={form.order}
                    onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>
              <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="w-4 h-4 accent-[#00E69A]"
                />
                <span>Visible</span>
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-xs text-[#B5BCD9] bg-white/5">
                  Cancel
                </button>
                <button type="submit" className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer">
                  Save FAQ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete FAQ?"
        description={`Delete "${deleteTarget?.question}" permanently?`}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={remove}
      />
    </div>
  );
};
