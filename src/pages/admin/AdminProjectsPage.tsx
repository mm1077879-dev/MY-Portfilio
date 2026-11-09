import React, { useEffect, useState, useCallback } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Star,
  ArrowUp,
  ArrowDown,
  X,
  Save,
  Eye,
  Upload,
} from 'lucide-react';
import { apiClient, extractApiErrorMessage, uploadMediaAsset } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { ProjectItem, ProjectCategory } from '../../types/portfolio';
import { parseDelimitedList, formatDelimitedList } from '../../utils/portfolioLogic';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { ResilientImage } from '../../components/common/ResilientImage';

const CATEGORIES: ProjectCategory[] = [
  'E-Commerce',
  'SaaS',
  'Web Apps',
  'Dashboards',
  'Business',
];

interface ProjectFormState {
  title: string;
  slug: string;
  category: ProjectCategory;
  shortDescription: string;
  overview: string;
  thumbnail: string;
  screenshotsRaw: string;
  technologiesRaw: string;
  featuresRaw: string;
  challenges: string;
  solutions: string;
  results: string;
  liveUrl: string;
  caseStudyUrl: string;
  githubUrl: string;
  featured: boolean;
  published: boolean;
}

const EMPTY_FORM: ProjectFormState = {
  title: '',
  slug: '',
  category: 'SaaS',
  shortDescription: '',
  overview: '',
  thumbnail: '/src/assets/images/project_taskflow_pro_1793526372048.jpg',
  screenshotsRaw: '',
  technologiesRaw: 'React, TypeScript, Node.js, MongoDB',
  featuresRaw: 'Responsive UI, Admin Dashboard, Secure REST API',
  challenges: '',
  solutions: '',
  results: '',
  liveUrl: '',
  caseStudyUrl: '',
  githubUrl: '',
  featured: true,
  published: true,
};

export const AdminProjectsPage: React.FC = () => {
  const { showToast } = useToast();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ProjectFormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProjectItem | null>(null);
  const [deleting, setDeleting] = useState(false);
  const screenshotInputRef = React.useRef<HTMLInputElement | null>(null);
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploadingScreenshot(true);
    const uploadedNames: string[] = [];
    let uploadError: unknown;
    try {
      for (const file of files) {
        try {
          const uploaded = await uploadMediaAsset(file);
          setForm((prev) => ({
            ...prev,
            screenshotsRaw: [
              ...parseDelimitedList(prev.screenshotsRaw),
              uploaded.url,
            ].join(', '),
          }));
          uploadedNames.push(uploaded.originalName);
        } catch (err) {
          uploadError ??= err;
        }
      }

      if (uploadError) {
        showToast(extractApiErrorMessage(uploadError, 'Failed to upload screenshot.'), 'error');
      }
      if (uploadedNames.length > 0) {
        showToast(
          uploadedNames.length === 1
            ? `Added screenshot (${uploadedNames[0]})`
            : `Added ${uploadedNames.length} screenshots`,
          'success'
        );
      }
    } finally {
      setUploadingScreenshot(false);
      if (screenshotInputRef.current) screenshotInputRef.current.value = '';
    }
  };

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/projects?includeDrafts=true&limit=50');
      setProjects(res.data?.data || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to load projects.'), 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (item: ProjectItem) => {
    setEditingId(item._id);
    setForm({
      title: item.title,
      slug: item.slug,
      category: item.category,
      shortDescription: item.shortDescription,
      overview: item.overview || '',
      thumbnail: item.thumbnail,
      screenshotsRaw: formatDelimitedList(item.screenshots),
      technologiesRaw: formatDelimitedList(item.technologies),
      featuresRaw: formatDelimitedList(item.features),
      challenges: item.challenges || '',
      solutions: item.solutions || '',
      results: item.results || '',
      liveUrl: item.liveUrl || '',
      caseStudyUrl: item.caseStudyUrl || '',
      githubUrl: item.githubUrl || '',
      featured: item.featured,
      published: item.published,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.shortDescription.trim() || !form.thumbnail.trim()) {
      showToast('Title, short description, and thumbnail are required.', 'error');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      slug: form.slug.trim() || undefined,
      category: form.category,
      shortDescription: form.shortDescription.trim(),
      overview: form.overview.trim(),
      thumbnail: form.thumbnail.trim(),
      screenshots: parseDelimitedList(form.screenshotsRaw),
      technologies: parseDelimitedList(form.technologiesRaw),
      features: parseDelimitedList(form.featuresRaw),
      challenges: form.challenges.trim(),
      solutions: form.solutions.trim(),
      results: form.results.trim(),
      liveUrl: form.liveUrl.trim(),
      caseStudyUrl: form.caseStudyUrl.trim(),
      githubUrl: form.githubUrl.trim(),
      featured: form.featured,
      published: form.published,
    };

    try {
      if (editingId) {
        await apiClient.put(`/projects/${editingId}`, payload);
        showToast('Project updated successfully!', 'success');
      } else {
        await apiClient.post('/projects', payload);
        showToast('New project published!', 'success');
      }
      setModalOpen(false);
      fetchProjects();
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Could not save project.'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleQuickFlag = async (
    item: ProjectItem,
    field: 'featured' | 'published'
  ) => {
    try {
      await apiClient.put(`/projects/${item._id}`, {
        [field]: !item[field],
      });
      setProjects((prev) =>
        prev.map((p) => (p._id === item._id ? { ...p, [field]: !p[field] } : p))
      );
      showToast(
        `${item.title}: ${field} set to ${!item[field] ? 'Yes' : 'No'}`,
        'info'
      );
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const handleMoveOrder = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= projects.length) return;
    const reordered = [...projects];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, moved);
    setProjects(reordered);

    try {
      await apiClient.put('/projects/reorder', {
        orderedIds: reordered.map((p) => p._id),
      });
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to reorder projects.'), 'error');
      fetchProjects();
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/projects/${deleteTarget._id}`);
      showToast(`Deleted "${deleteTarget.title}"`, 'success');
      setDeleteTarget(null);
      fetchProjects();
    } catch (err) {
      showToast(extractApiErrorMessage(err, 'Failed to delete project.'), 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
            Manage Projects
          </h1>
          <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
            Create, edit, reorder, feature, publish/unpublish, and delete portfolio projects stored in MongoDB.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreate}
          className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white whitespace-nowrap shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Projects Table / Grid */}
      <div className="cosmic-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-[#B5BCD9]">
            Loading projects from MongoDB...
          </div>
        ) : projects.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <p className="font-display font-bold text-lg text-white">No projects yet</p>
            <button
              type="button"
              onClick={openCreate}
              className="btn-neon-primary px-5 py-2.5 rounded-xl text-xs font-semibold text-white"
            >
              Create First Project
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-[11px] font-semibold text-[#B5BCD9] bg-[#05081D]/60">
                  <th className="py-3.5 px-4">Order</th>
                  <th className="py-3.5 px-4">Project</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Views</th>
                  <th className="py-3.5 px-4">Featured</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.07] text-xs">
                {projects.map((proj, idx) => (
                  <tr key={proj._id} className="hover:bg-white/[0.02]">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => handleMoveOrder(idx, -1)}
                          aria-label={`Move ${proj.title} up`}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          disabled={idx === projects.length - 1}
                          onClick={() => handleMoveOrder(idx, 1)}
                          aria-label={`Move ${proj.title} down`}
                          className="p-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-10 rounded-lg overflow-hidden border border-white/10 shrink-0">
                          <ResilientImage src={proj.thumbnail} alt={proj.title} />
                        </div>
                        <div>
                          <div className="font-bold text-white">{proj.title}</div>
                          <div className="text-[11px] text-[#B5BCD9] line-clamp-1 max-w-xs">
                            {proj.shortDescription}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#00D9FF] font-medium">
                      {proj.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#E2E8F0]">
                      <span className="inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5 text-[#B5BCD9]" />
                        {proj.views}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleQuickFlag(proj, 'featured')}
                        aria-label={`Toggle featured status for ${proj.title}`}
                        className={`inline-flex items-center gap-1 font-semibold cursor-pointer ${
                          proj.featured ? 'text-amber-400' : 'text-[#B5BCD9]/50'
                        }`}
                      >
                        <Star
                          className={`w-4 h-4 ${proj.featured ? 'fill-amber-400' : ''}`}
                        />
                        <span>{proj.featured ? 'Featured' : 'Standard'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggleQuickFlag(proj, 'published')}
                        className={`font-semibold cursor-pointer ${
                          proj.published ? 'text-[#00E69A]' : 'text-amber-400'
                        }`}
                      >
                        {proj.published ? 'Published' : 'Draft'}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(proj)}
                          aria-label={`Edit ${proj.title}`}
                          className="p-2 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] hover:bg-[#087BFF]/30 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(proj)}
                          aria-label={`Delete ${proj.title}`}
                          className="p-2 rounded-lg bg-rose-500/15 text-rose-400 hover:bg-rose-500/30 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Project Modal */}
      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="project-editor-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
        >
          <div className="w-full max-w-3xl rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 sm:p-8 max-h-[92vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between">
              <h2 id="project-editor-title" className="font-display font-bold text-xl text-white">
                {editingId ? 'Edit Project' : 'Create New Project'}
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Close project editor"
                className="text-[#B5BCD9] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Project Title *
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
                    Category *
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value as ProjectCategory })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Short Description (Card Summary) *
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

              <ImageUploaderField
                label="Primary Project Thumbnail *"
                value={form.thumbnail}
                onChange={(url) => setForm({ ...form, thumbnail: url })}
              />

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label className="block text-xs font-semibold text-[#E2E8F0]">
                    Additional Screenshot URLs (comma-separated)
                  </label>
                  <input
                    ref={screenshotInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.gif"
                    multiple
                    onChange={handleScreenshotUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    disabled={uploadingScreenshot}
                    onClick={() => screenshotInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#00D9FF] bg-[#087BFF]/15 border border-[#087BFF]/35 hover:bg-[#087BFF]/30 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>{uploadingScreenshot ? 'Uploading...' : 'Upload Screenshot From Device'}</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={form.screenshotsRaw}
                  onChange={(e) =>
                    setForm({ ...form, screenshotsRaw: e.target.value })
                  }
                  placeholder="/uploads/screen1.jpg, /uploads/screen2.jpg"
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                />
                {parseDelimitedList(form.screenshotsRaw).length > 0 && (
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {parseDelimitedList(form.screenshotsRaw).map((url, index) => (
                      <div
                        key={`${url}-${index}`}
                        className="aspect-video overflow-hidden rounded-lg border border-white/10 bg-[#05081D]"
                      >
                        <ResilientImage
                          src={url}
                          alt={`Project screenshot ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Technologies (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.technologiesRaw}
                    onChange={(e) =>
                      setForm({ ...form, technologiesRaw: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Key Features (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={form.featuresRaw}
                    onChange={(e) => setForm({ ...form, featuresRaw: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Case Study Overview
                </label>
                <textarea
                  rows={3}
                  value={form.overview}
                  onChange={(e) => setForm({ ...form, overview: e.target.value })}
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Challenges
                  </label>
                  <textarea
                    rows={2}
                    value={form.challenges}
                    onChange={(e) => setForm({ ...form, challenges: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Solutions
                  </label>
                  <textarea
                    rows={2}
                    value={form.solutions}
                    onChange={(e) => setForm({ ...form, solutions: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Results
                  </label>
                  <textarea
                    rows={2}
                    value={form.results}
                    onChange={(e) => setForm({ ...form, results: e.target.value })}
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Live Preview URL
                  </label>
                  <input
                    type="text"
                    value={form.liveUrl}
                    onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    GitHub Repository URL
                  </label>
                  <input
                    type="text"
                    value={form.githubUrl}
                    onChange={(e) => setForm({ ...form, githubUrl: e.target.value })}
                    placeholder="https://github.com/..."
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="w-4 h-4 accent-[#8B19FF]"
                  />
                  <span>Mark as Featured (Homepage)</span>
                </label>

                <label className="inline-flex items-center gap-2 text-xs font-semibold text-white cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                    className="w-4 h-4 accent-[#00E69A]"
                  />
                  <span>Published on Public Portfolio</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-[#B5BCD9] bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-neon-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white disabled:opacity-60 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : editingId ? 'Update Project' : 'Create Project'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete Project?"
        description={`Are you sure you want to permanently remove "${deleteTarget?.title}" from MongoDB? This action cannot be undone.`}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
