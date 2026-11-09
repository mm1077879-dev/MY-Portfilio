import React, { useEffect, useState, useCallback } from 'react';
import { Save, Plus, Pencil, Trash2, X } from 'lucide-react';
import { apiClient, extractApiErrorMessage } from '../../services/api';
import { useToast } from '../../context/ToastContext';
import type { AboutData, TimelineMilestone } from '../../types/portfolio';
import { ImageUploaderField } from '../../components/common/ImageUploaderField';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminAboutPage: React.FC = () => {
  const { showToast } = useToast();
  const [about, setAbout] = useState<AboutData>({
    badgeText: 'About Me',
    headline: "Hi, I'm Mahim Dev",
    developerName: 'Mahim Dev',
    subtitle: 'Full-Stack Developer & Problem Solver',
    biography: '',
    extendedBio: '',
    profileImage: '',
    cvFileUrl: '',
    trustText: '',
    experienceYears: '2+ Years',
    projectsDelivered: '100+',
    happyClients: '50+',
    clientSatisfaction: '99%',
    whyChooseMe: [],
    workflowSteps: [],
  });
  const [timeline, setTimeline] = useState<TimelineMilestone[]>([]);
  const [savingAbout, setSavingAbout] = useState(false);

  // Timeline CRUD modal
  const [milestoneModal, setMilestoneModal] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [milestoneForm, setMilestoneForm] = useState({
    year: '2025',
    title: '',
    subtitle: '',
    description: '',
    category: 'career' as 'education' | 'career' | 'milestone',
    published: true,
  });
  const [deleteMilestone, setDeleteMilestone] = useState<TimelineMilestone | null>(null);

  const loadAboutBundle = useCallback(async () => {
    try {
      const res = await apiClient.get('/about?includeDrafts=true');
      if (res.data?.data?.about) {
        setAbout(res.data.data.about);
      }
      setTimeline(res.data?.data?.timeline || []);
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  }, [showToast]);

  useEffect(() => {
    loadAboutBundle();
  }, [loadAboutBundle]);

  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAbout(true);
    try {
      await apiClient.put('/about', about);
      showToast('About profile & statistics updated!', 'success');
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    } finally {
      setSavingAbout(false);
    }
  };

  const openNewMilestone = () => {
    setEditingMilestoneId(null);
    setMilestoneForm({
      year: '2025',
      title: '',
      subtitle: '',
      description: '',
      category: 'career',
      published: true,
    });
    setMilestoneModal(true);
  };

  const openEditMilestone = (item: TimelineMilestone) => {
    setEditingMilestoneId(item._id);
    setMilestoneForm({
      year: item.year,
      title: item.title,
      subtitle: item.subtitle || '',
      description: item.description,
      category: item.category,
      published: item.published,
    });
    setMilestoneModal(true);
  };

  const handleSaveMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingMilestoneId) {
        await apiClient.put(`/about/timeline/${editingMilestoneId}`, milestoneForm);
        showToast('Career milestone updated!', 'success');
      } else {
        await apiClient.post('/about/timeline', milestoneForm);
        showToast('Career milestone added!', 'success');
      }
      setMilestoneModal(false);
      loadAboutBundle();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  const handleDeleteMilestone = async () => {
    if (!deleteMilestone) return;
    try {
      await apiClient.delete(`/about/timeline/${deleteMilestone._id}`);
      showToast('Milestone deleted.', 'success');
      setDeleteMilestone(null);
      loadAboutBundle();
    } catch (err) {
      showToast(extractApiErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div>
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
          Manage About &amp; Career Timeline
        </h1>
        <p className="text-xs sm:text-sm text-[#B5BCD9] mt-1">
          Edit biography, profile photograph, downloadable CV document, statistics, and timeline milestones.
        </p>
      </div>

      {/* Biography & Statistics Form */}
      <form onSubmit={handleSaveAbout} className="cosmic-card rounded-3xl p-6 sm:p-8 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Developer Name
            </label>
            <input
              type="text"
              value={about.developerName}
              onChange={(e) => setAbout({ ...about, developerName: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Page Headline
            </label>
            <input
              type="text"
              value={about.headline}
              onChange={(e) => setAbout({ ...about, headline: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Professional Subtitle
            </label>
            <input
              type="text"
              value={about.subtitle}
              onChange={(e) => setAbout({ ...about, subtitle: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Trust Line
            </label>
            <input
              type="text"
              value={about.trustText}
              onChange={(e) => setAbout({ ...about, trustText: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            Primary Biography
          </label>
          <textarea
            rows={4}
            value={about.biography}
            onChange={(e) => setAbout({ ...about, biography: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
            Extended Biography
          </label>
          <textarea
            rows={3}
            value={about.extendedBio}
            onChange={(e) => setAbout({ ...about, extendedBio: e.target.value })}
            className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3.5 py-2.5 text-sm text-white"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <ImageUploaderField
            label="About Page Profile Photo"
            value={about.profileImage}
            onChange={(url) => setAbout({ ...about, profileImage: url })}
          />
          <ImageUploaderField
            label="CV / Resume File (PDF Supported)"
            value={about.cvFileUrl}
            acceptPdf={true}
            onChange={(url) => setAbout({ ...about, cvFileUrl: url })}
            helperText="Upload a PDF resume or keep /api/v1/about/cv-download"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Experience
            </label>
            <input
              type="text"
              value={about.experienceYears}
              onChange={(e) => setAbout({ ...about, experienceYears: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Projects Delivered
            </label>
            <input
              type="text"
              value={about.projectsDelivered}
              onChange={(e) => setAbout({ ...about, projectsDelivered: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Happy Clients
            </label>
            <input
              type="text"
              value={about.happyClients}
              onChange={(e) => setAbout({ ...about, happyClients: e.target.value })}
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
              Satisfaction
            </label>
            <input
              type="text"
              value={about.clientSatisfaction}
              onChange={(e) =>
                setAbout({ ...about, clientSatisfaction: e.target.value })
              }
              className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingAbout}
          className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{savingAbout ? 'Saving...' : 'Save About Profile'}</span>
        </button>
      </form>

      {/* Career Timeline Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">
            My Journey Timeline Milestones
          </h2>
          <button
            type="button"
            onClick={openNewMilestone}
            className="btn-neon-primary inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Milestone</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {timeline.map((item) => (
            <div
              key={item._id}
              className="cosmic-card rounded-2xl p-5 flex flex-col justify-between gap-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-mono font-bold text-[#00D9FF]">{item.year}</span>
                  <span className="capitalize text-[#B5BCD9]">{item.category}</span>
                </div>
                <h3 className="font-display font-bold text-base text-white">
                  {item.title}
                </h3>
                <p className="text-xs text-[#B5BCD9] mt-1">{item.description}</p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => openEditMilestone(item)}
                  aria-label={`Edit ${item.title}`}
                  className="p-1.5 rounded-lg bg-[#087BFF]/15 text-[#00D9FF] cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteMilestone(item)}
                  aria-label={`Delete ${item.title}`}
                  className="p-1.5 rounded-lg bg-rose-500/15 text-rose-400 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Milestone Modal */}
      {milestoneModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75"
        >
          <div className="w-full max-w-lg rounded-3xl bg-[#090E2C] border border-[#8B19FF]/45 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                {editingMilestoneId ? 'Edit Milestone' : 'Add Milestone'}
              </h3>
              <button
                type="button"
                onClick={() => setMilestoneModal(false)}
                aria-label="Close modal"
                className="text-[#B5BCD9] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveMilestone} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Year *
                  </label>
                  <input
                    type="text"
                    required
                    value={milestoneForm.year}
                    onChange={(e) =>
                      setMilestoneForm({ ...milestoneForm, year: e.target.value })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                    Type
                  </label>
                  <select
                    value={milestoneForm.category}
                    onChange={(e) =>
                      setMilestoneForm({
                        ...milestoneForm,
                        category: e.target.value as 'education' | 'career' | 'milestone',
                      })
                    }
                    className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                  >
                    <option value="milestone">Milestone</option>
                    <option value="career">Career</option>
                    <option value="education">Education</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={milestoneForm.title}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, title: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#E2E8F0] mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  value={milestoneForm.description}
                  onChange={(e) =>
                    setMilestoneForm({ ...milestoneForm, description: e.target.value })
                  }
                  className="w-full rounded-xl bg-[#05081D] border border-white/15 px-3 py-2 text-xs text-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMilestoneModal(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#B5BCD9] bg-white/5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-neon-primary px-5 py-2 rounded-xl text-xs font-semibold text-white cursor-pointer"
                >
                  Save Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(deleteMilestone)}
        title="Delete Milestone?"
        description={`Delete "${deleteMilestone?.title}" from your career timeline?`}
        onCancel={() => setDeleteMilestone(null)}
        onConfirm={handleDeleteMilestone}
      />
    </div>
  );
};
