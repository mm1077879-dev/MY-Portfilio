import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { SiteProvider } from './context/SiteContext';
import { PublicLayout } from './layouts/PublicLayout';
import { HomePage } from './pages/Home/HomePage';
import { BrandedReloadOverlay } from './components/common/BrandedReloadOverlay';

// Route-based lazy loading for secondary public routes & protected Admin CMS
const AboutPage = lazy(() =>
  import('./pages/About/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const ServicesPage = lazy(() =>
  import('./pages/Services/ServicesPage').then((m) => ({ default: m.ServicesPage }))
);
const ProjectsPage = lazy(() =>
  import('./pages/Projects/ProjectsPage').then((m) => ({ default: m.ProjectsPage }))
);
const ProjectDetailPage = lazy(() =>
  import('./pages/Projects/ProjectDetailPage').then((m) => ({
    default: m.ProjectDetailPage,
  }))
);
const ContactPage = lazy(() =>
  import('./pages/Contact/ContactPage').then((m) => ({ default: m.ContactPage }))
);

const AdminLayout = lazy(() =>
  import('./layouts/AdminLayout').then((m) => ({ default: m.AdminLayout }))
);
const AdminLoginPage = lazy(() =>
  import('./pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage }))
);
const AdminOverviewPage = lazy(() =>
  import('./pages/admin/AdminOverviewPage').then((m) => ({
    default: m.AdminOverviewPage,
  }))
);
const AdminBannerPage = lazy(() =>
  import('./pages/admin/AdminBannerPage').then((m) => ({ default: m.AdminBannerPage }))
);
const AdminProjectsPage = lazy(() =>
  import('./pages/admin/AdminProjectsPage').then((m) => ({
    default: m.AdminProjectsPage,
  }))
);
const AdminServicesPage = lazy(() =>
  import('./pages/admin/AdminServicesPage').then((m) => ({
    default: m.AdminServicesPage,
  }))
);
const AdminAboutPage = lazy(() =>
  import('./pages/admin/AdminAboutPage').then((m) => ({ default: m.AdminAboutPage }))
);
const AdminTestimonialsPage = lazy(() =>
  import('./pages/admin/AdminCmsCollectionsPage').then((m) => ({
    default: m.AdminTestimonialsPage,
  }))
);
const AdminSkillsPage = lazy(() =>
  import('./pages/admin/AdminCmsCollectionsPage').then((m) => ({
    default: m.AdminSkillsPage,
  }))
);
const AdminPricingPage = lazy(() =>
  import('./pages/admin/AdminCmsCollectionsPage').then((m) => ({
    default: m.AdminPricingPage,
  }))
);
const AdminFaqPage = lazy(() =>
  import('./pages/admin/AdminCmsCollectionsPage').then((m) => ({
    default: m.AdminFaqPage,
  }))
);
const AdminMessagesPage = lazy(() =>
  import('./pages/admin/AdminMessagesPage').then((m) => ({
    default: m.AdminMessagesPage,
  }))
);
const AdminNotificationsPage = lazy(() =>
  import('./pages/admin/AdminNotificationsPage').then((m) => ({
    default: m.AdminNotificationsPage,
  }))
);
const AdminSiteSettingsPage = lazy(() =>
  import('./pages/admin/AdminSystemSettingsPage').then((m) => ({
    default: m.AdminSiteSettingsPage,
  }))
);
const AdminSeoSettingsPage = lazy(() =>
  import('./pages/admin/AdminSystemSettingsPage').then((m) => ({
    default: m.AdminSeoSettingsPage,
  }))
);
const AdminSocialLinksPage = lazy(() =>
  import('./pages/admin/AdminSystemSettingsPage').then((m) => ({
    default: m.AdminSocialLinksPage,
  }))
);
const AdminAnalyticsPage = lazy(() =>
  import('./pages/admin/AdminSystemSettingsPage').then((m) => ({
    default: m.AdminAnalyticsPage,
  }))
);
const AdminFooterPage = lazy(() =>
  import('./pages/admin/AdminFooterPage').then((m) => ({ default: m.AdminFooterPage }))
);
const AdminNewsletterPage = lazy(() =>
  import('./pages/admin/AdminNewsletterPage').then((m) => ({
    default: m.AdminNewsletterPage,
  }))
);
const AdminProfilePage = lazy(() =>
  import('./pages/admin/AdminSystemSettingsPage').then((m) => ({
    default: m.AdminProfilePage,
  }))
);

const ScrollToTopOnNavigate: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const RouteLoader: React.FC = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="cosmic-card rounded-2xl px-6 py-4 text-xs font-medium text-[#B5BCD9] animate-pulse">
      Loading view...
    </div>
  </div>
);

const NotFoundPage: React.FC = () => (
  <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
    <h1 className="font-display font-extrabold text-5xl text-gradient-purple">404</h1>
    <h2 className="font-display font-bold text-2xl text-white">Page Not Found</h2>
    <p className="text-sm text-[#B5BCD9]">
      The page you requested does not exist or may have been moved.
    </p>
    <Link
      to="/"
      className="btn-neon-primary inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white"
    >
      Return to Homepage
    </Link>
  </div>
);

export function App() {
  return (
    <BrowserRouter>
      <BrandedReloadOverlay />
      <ToastProvider>
        <AuthProvider>
          <SiteProvider>
            <ScrollToTopOnNavigate />
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Route>

                {/* Admin Authentication */}
                <Route path="/admin/login" element={<AdminLoginPage />} />

                {/* Protected Admin CMS Routes */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminOverviewPage />} />
                  <Route path="banner" element={<AdminBannerPage />} />
                  <Route path="projects" element={<AdminProjectsPage />} />
                  <Route path="services" element={<AdminServicesPage />} />
                  <Route path="about" element={<AdminAboutPage />} />
                  <Route path="testimonials" element={<AdminTestimonialsPage />} />
                  <Route path="skills" element={<AdminSkillsPage />} />
                  <Route path="pricing" element={<AdminPricingPage />} />
                  <Route path="faq" element={<AdminFaqPage />} />
                  <Route
                    path="messages"
                    element={
                      <AdminMessagesPage
                        defaultStatusFilter="All"
                        pageTitle="All Messages"
                      />
                    }
                  />
                  <Route
                    path="inquiries"
                    element={
                      <AdminMessagesPage
                        defaultStatusFilter="New"
                        pageTitle="New Contact Inquiries"
                      />
                    }
                  />
                  <Route path="newsletter" element={<AdminNewsletterPage />} />
                  <Route path="notifications" element={<AdminNotificationsPage />} />
                  <Route path="settings" element={<AdminSiteSettingsPage />} />
                  <Route path="footer" element={<AdminFooterPage />} />
                  <Route path="seo" element={<AdminSeoSettingsPage />} />
                  <Route path="socials" element={<AdminSocialLinksPage />} />
                  <Route path="analytics" element={<AdminAnalyticsPage />} />
                  <Route path="profile" element={<AdminProfilePage />} />
                </Route>
              </Routes>
            </Suspense>
          </SiteProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
