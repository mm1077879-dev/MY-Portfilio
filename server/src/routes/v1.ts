import { Router } from 'express';
import {
  loginAdmin,
  logoutAdmin,
  getSessionStatus,
  getCurrentAdmin,
  updateAdminProfile,
  changeAdminPassword,
} from '../controllers/authController';
import {
  getProjects,
  getProjectByIdOrSlug,
  createProject,
  updateProject,
  reorderProjects,
  deleteProject,
} from '../controllers/projectController';
import {
  getServices,
  getServiceByIdOrSlug,
  createService,
  updateService,
  deleteService,
} from '../controllers/serviceController';
import {
  getAboutBundle,
  updateAbout,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  downloadResumeSummary,
} from '../controllers/aboutController';
import {
  getTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getFAQs,
  createFAQ,
  updateFAQ,
  deleteFAQ,
  getPricingPackages,
  createPricingPackage,
  updatePricingPackage,
  deletePricingPackage,
  getSiteSettings,
  updateSiteSettings,
} from '../controllers/cmsController';
import {
  submitContactMessage,
  getMessages,
  getMessageById,
  updateMessage,
  deleteMessage,
} from '../controllers/messageController';
import {
  trackPageVisit,
  getAnalyticsOverview,
  getVisitorsAnalytics,
  getPagesAnalytics,
} from '../controllers/analyticsController';
import {
  listMediaAssets,
  uploadMediaFile,
  deleteMediaFile,
} from '../controllers/uploadController';
import {
  subscribeNewsletter,
  getNewsletterSubscribers,
  deleteNewsletterSubscriber,
} from '../controllers/newsletterController';
import { requireAuth, requireRole } from '../middleware/auth';
import { loginRateLimiter, contactRateLimiter } from '../middleware/security';
import { uploadMiddleware } from '../middleware/upload';
import { getDatabaseHealth } from '../config/database';
import {
  deleteNotification,
  getNotificationUnreadCount,
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  streamAdminNotifications,
} from '../controllers/notificationController';

export const apiV1Router = Router();

// Health check
apiV1Router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      version: 'v1',
      timestamp: new Date().toISOString(),
      database: getDatabaseHealth(),
    },
  });
});

// Authentication
apiV1Router.post('/auth/login', loginRateLimiter, loginAdmin);
apiV1Router.post('/auth/logout', logoutAdmin);
apiV1Router.get('/auth/session', getSessionStatus);
apiV1Router.get('/auth/me', requireAuth, getCurrentAdmin);
apiV1Router.put('/auth/me', requireAuth, updateAdminProfile);
apiV1Router.put('/auth/change-password', requireAuth, changeAdminPassword);

// Admin notifications
apiV1Router.get(
  '/notifications/stream',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  streamAdminNotifications
);
apiV1Router.get(
  '/notifications/unread-count',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getNotificationUnreadCount
);
apiV1Router.get(
  '/notifications',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getNotifications
);
apiV1Router.patch(
  '/notifications/read-all',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  markAllNotificationsRead
);
apiV1Router.patch(
  '/notifications/:id/read',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  markNotificationRead
);
apiV1Router.delete(
  '/notifications/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  deleteNotification
);

// Projects
apiV1Router.get('/projects', getProjects);
apiV1Router.put(
  '/projects/reorder',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  reorderProjects
);
apiV1Router.get('/projects/:id', getProjectByIdOrSlug);
apiV1Router.post(
  '/projects',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createProject
);
apiV1Router.put(
  '/projects/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateProject
);
apiV1Router.delete(
  '/projects/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteProject
);

// Services
apiV1Router.get('/services', getServices);
apiV1Router.get('/services/:id', getServiceByIdOrSlug);
apiV1Router.post(
  '/services',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createService
);
apiV1Router.put(
  '/services/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateService
);
apiV1Router.delete(
  '/services/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteService
);

// About & Timeline
apiV1Router.get('/about', getAboutBundle);
apiV1Router.get('/about/cv-download', downloadResumeSummary);
apiV1Router.put(
  '/about',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateAbout
);
apiV1Router.post(
  '/about/timeline',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createTimelineItem
);
apiV1Router.put(
  '/about/timeline/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateTimelineItem
);
apiV1Router.delete(
  '/about/timeline/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteTimelineItem
);

// Testimonials
apiV1Router.get('/testimonials', getTestimonials);
apiV1Router.post(
  '/testimonials',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createTestimonial
);
apiV1Router.put(
  '/testimonials/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateTestimonial
);
apiV1Router.delete(
  '/testimonials/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteTestimonial
);

// Skills
apiV1Router.get('/skills', getSkills);
apiV1Router.post(
  '/skills',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createSkill
);
apiV1Router.put(
  '/skills/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateSkill
);
apiV1Router.delete(
  '/skills/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteSkill
);

// Messages & Inquiries
apiV1Router.post('/messages', contactRateLimiter, submitContactMessage);
apiV1Router.get(
  '/messages',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getMessages
);
apiV1Router.get(
  '/messages/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getMessageById
);
apiV1Router.put(
  '/messages/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateMessage
);
apiV1Router.delete(
  '/messages/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteMessage
);

// Newsletter Subscriptions
apiV1Router.post('/newsletter/subscribe', contactRateLimiter, subscribeNewsletter);
apiV1Router.get(
  '/newsletter',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getNewsletterSubscribers
);
apiV1Router.delete(
  '/newsletter/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteNewsletterSubscriber
);

// FAQ
apiV1Router.get('/faq', getFAQs);
apiV1Router.post(
  '/faq',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createFAQ
);
apiV1Router.put(
  '/faq/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updateFAQ
);
apiV1Router.delete(
  '/faq/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteFAQ
);

// Pricing
apiV1Router.get('/pricing', getPricingPackages);
apiV1Router.post(
  '/pricing',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  createPricingPackage
);
apiV1Router.put(
  '/pricing/:id',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  updatePricingPackage
);
apiV1Router.delete(
  '/pricing/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deletePricingPackage
);

// Site Settings (General, Banner, Stats, SEO, Social Links)
apiV1Router.get('/settings', getSiteSettings);
apiV1Router.put(
  '/settings',
  requireAuth,
  requireRole('superadmin', 'admin'),
  updateSiteSettings
);

// Analytics
apiV1Router.post('/analytics/track', trackPageVisit);
apiV1Router.get(
  '/analytics/overview',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getAnalyticsOverview
);
apiV1Router.get(
  '/analytics/visitors',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getVisitorsAnalytics
);
apiV1Router.get(
  '/analytics/pages',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getPagesAnalytics
);

// Media Uploads
apiV1Router.get(
  '/upload',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  listMediaAssets
);
apiV1Router.post(
  '/upload',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  uploadMiddleware.single('file'),
  uploadMediaFile
);
apiV1Router.delete(
  '/upload/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteMediaFile
);

// Newsletter Subscriptions
apiV1Router.post('/newsletter/subscribe', subscribeNewsletter);
apiV1Router.get(
  '/newsletter/subscribers',
  requireAuth,
  requireRole('superadmin', 'admin', 'editor'),
  getNewsletterSubscribers
);
apiV1Router.delete(
  '/newsletter/subscribers/:id',
  requireAuth,
  requireRole('superadmin', 'admin'),
  deleteNewsletterSubscriber
);
