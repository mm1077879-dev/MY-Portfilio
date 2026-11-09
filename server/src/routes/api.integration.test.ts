import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { createExpressApp } from '../app';
import { ensureSeededDatabase } from '../services/seedService';
import { env } from '../config/env';
import { UPLOADS_DIR } from '../middleware/upload';
import {
  Admin,
  Project,
  Service,
  About,
  Timeline,
  Testimonial,
  Skill,
  Message,
  FAQ,
  Pricing,
  SiteSettings,
  Analytics,
  MediaAsset,
  NewsletterSubscriber,
  Notification,
} from '../models';

let mongoServer: MongoMemoryServer;
let httpServer: http.Server;
let baseUrl = '';
let superAdminToken = '';
let editorToken = '';
const TEST_ADMIN_EMAIL = 'admin-integration@mahimdev.com';
const TEST_ADMIN_PASSWORD = 'IntegrationPass@123';

interface JsonResponse {
  status: number;
  headers: Headers;
  body: any;
}

function getAuthToken(response: JsonResponse): string {
  const cookie = response.headers.get('set-cookie') || '';
  const token = cookie.match(/mahim_admin_token=([^;]+)/)?.[1];
  assert.ok(token, 'Authentication response should set the HttpOnly session cookie.');
  return token;
}

async function apiRequest(
  endpoint: string,
  options: {
    method?: string;
    token?: string;
    cookie?: string;
    body?: unknown;
    headers?: Record<string, string>;
  } = {}
): Promise<JsonResponse> {
  const headers: Record<string, string> = {
    ...(options.headers || {}),
  };
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options.cookie) {
    headers.Cookie = `mahim_admin_token=${options.cookie}`;
  }
  let payload: BodyInit | undefined;
  if (options.body !== undefined) {
    if (options.body instanceof FormData) {
      payload = options.body;
    } else {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(options.body);
    }
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method: options.method || 'GET',
    headers,
    body: payload,
  });

  const contentType = res.headers.get('content-type') || '';
  const parsedBody = contentType.includes('application/json')
    ? await res.json()
    : await res.text();

  return {
    status: res.status,
    headers: res.headers,
    body: parsedBody,
  };
}

before(async () => {
  env.CLOUDINARY_CLOUD_NAME = '';
  env.CLOUDINARY_API_KEY = '';
  env.CLOUDINARY_API_SECRET = '';
  env.EMAIL_SERVICE_HOST = '';
  env.EMAIL_SERVICE_USER = '';
  env.EMAIL_SERVICE_PASSWORD = '';
  env.EMAIL_FROM_ADDRESS = '';
  env.INITIAL_ADMIN_EMAIL = TEST_ADMIN_EMAIL;
  env.INITIAL_ADMIN_PASSWORD = TEST_ADMIN_PASSWORD;

  mongoServer = await MongoMemoryServer.create({
    instance: { dbName: 'mahim_audit_isolated_test_db' },
  });
  await mongoose.connect(mongoServer.getUri());
  await ensureSeededDatabase(false);

  // Provision an isolated editor account to verify RBAC enforcement
  const editorHash = await bcrypt.hash('EditorPass@123', 10);
  await Admin.create({
    name: 'Audit Editor',
    email: 'editor-test@mahimdev.com',
    passwordHash: editorHash,
    role: 'editor',
  });

  const app = createExpressApp();
  httpServer = http.createServer(app);
  await new Promise<void>((resolve) => {
    httpServer.listen(0, '127.0.0.1', () => resolve());
  });
  const addr = httpServer.address();
  if (!addr || typeof addr === 'string') {
    throw new Error('Failed to bind ephemeral integration test server');
  }
  baseUrl = `http://127.0.0.1:${addr.port}`;
});



after(async () => {
  if (httpServer) {
    await new Promise<void>((resolve) => httpServer.close(() => resolve()));
  }
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});

test('admin analytics pages endpoint resolves referrer normalization without aggregation errors', async () => {
  const login = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: {
      email: TEST_ADMIN_EMAIL,
      password: TEST_ADMIN_PASSWORD,
    },
  });
  assert.equal(login.status, 200);

  const cookie = getAuthToken(login);
  await Analytics.insertMany([
    { path: '/', visitorHash: 'hash-google', referrer: 'https://www.google.com/search?q=example', deviceType: 'desktop', dateBucket: new Date().toISOString().slice(0, 10) },
    { path: '/projects', visitorHash: 'hash-github', referrer: 'https://github.com/example', deviceType: 'desktop', dateBucket: new Date().toISOString().slice(0, 10) },
    { path: '/contact', visitorHash: 'hash-blank', referrer: '', deviceType: 'mobile', dateBucket: new Date().toISOString().slice(0, 10) },
  ]);

  const response = await apiRequest('/api/v1/analytics/pages?days=30', { cookie });
  assert.equal(response.status, 200);
  assert.equal(response.body.success, true);
  assert.ok(Array.isArray(response.body.data.popularPages));
  assert.ok(Array.isArray(response.body.data.referrers));
});

test('seed cleanup updates legacy project URLs with an aggregation pipeline', async () => {
  const project = await Project.create({
    title: 'Pipeline Cleanup Regression',
    slug: 'pipeline-cleanup-regression',
    category: 'Web Apps',
    shortDescription: 'Regression fixture for seed cleanup.',
    thumbnail: '/test-thumbnail.jpg',
    liveUrl: 'https://example.com/legacy-project',
  });

  await ensureSeededDatabase(false);

  const updatedProject = await Project.findById(project._id);
  assert.equal(updatedProject?.liveUrl, '/projects/pipeline-cleanup-regression');
});

test('1. System Health, SEO Routes & Production Asset Static Serving', async () => {
  const health = await apiRequest('/api/v1/health');
  assert.equal(health.status, 200);
  assert.equal(health.body.success, true);
  assert.equal(health.body.data.status, 'ok');

  const robots = await apiRequest('/robots.txt');
  assert.equal(robots.status, 200);
  assert.match(String(robots.body), /Disallow: \/admin/);

  const sitemap = await apiRequest('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.match(String(sitemap.body), /<loc>.*\/projects\/nextgen-mart<\/loc>/);

  const heroImg = await fetch(
    `${baseUrl}/src/assets/images/hero_developer_portrait_1793526368603.jpg`
  );
  assert.equal(heroImg.status, 200);
  assert.match(heroImg.headers.get('content-type') || '', /image\/jpeg/);
  assert.equal(heroImg.headers.get('x-content-type-options'), 'nosniff');

  // Verify source code files outside src/assets/images are NEVER served
  const sourceAttempt = await fetch(`${baseUrl}/src/App.tsx`);
  assert.equal(sourceAttempt.status, 404);
});

test('configured initial admin credentials synchronize without modifying other admins', async () => {
  const originalEmail = env.INITIAL_ADMIN_EMAIL;
  const originalPassword = env.INITIAL_ADMIN_PASSWORD;
  const initialAdmin = await Admin.findOne({ email: originalEmail }).select(
    '+passwordHash +isInitialAdmin'
  );
  assert.ok(initialAdmin);
  const initialAdminId = String(initialAdmin._id);
  assert.equal(initialAdmin.isInitialAdmin, true);

  const rotatedEmail = 'rotated-initial-admin@mahimdev.com';
  env.INITIAL_ADMIN_EMAIL = rotatedEmail;
  await ensureSeededDatabase(false);

  const emailSynchronizedAdmin = await Admin.findOne({ isInitialAdmin: true }).select(
    '+passwordHash +isInitialAdmin'
  );
  assert.ok(emailSynchronizedAdmin);
  assert.equal(String(emailSynchronizedAdmin._id), initialAdminId);
  assert.equal(emailSynchronizedAdmin.email, rotatedEmail);
  assert.equal(await emailSynchronizedAdmin.comparePassword(originalPassword), true);

  const oldEmailLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: originalEmail, password: originalPassword },
  });
  assert.equal(oldEmailLogin.status, 401);
  const newEmailLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: rotatedEmail, password: originalPassword },
  });
  assert.equal(newEmailLogin.status, 200);
  const priorSessionToken = getAuthToken(newEmailLogin);

  const rotatedPassword = 'RotatedInitialPass@456';
  env.INITIAL_ADMIN_PASSWORD = rotatedPassword;
  await ensureSeededDatabase(false);

  const synchronizedAdmin = await Admin.findOne({ isInitialAdmin: true }).select(
    '+passwordHash +isInitialAdmin'
  );
  assert.ok(synchronizedAdmin);
  assert.equal(String(synchronizedAdmin._id), initialAdminId);
  assert.equal(synchronizedAdmin.email, rotatedEmail);
  assert.equal(await synchronizedAdmin.comparePassword(rotatedPassword), true);
  assert.equal(await Admin.countDocuments({ isInitialAdmin: true }), 1);
  assert.equal(await Admin.countDocuments(), 2);

  const oldPasswordLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: rotatedEmail, password: originalPassword },
  });
  assert.equal(oldPasswordLogin.status, 401);

  const currentCredentials = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: rotatedEmail, password: rotatedPassword },
  });
  assert.equal(currentCredentials.status, 200);
  assert.equal('passwordHash' in currentCredentials.body.data.admin, false);
  const revokedSession = await apiRequest('/api/v1/auth/me', { token: priorSessionToken });
  assert.equal(revokedSession.status, 401);

  env.INITIAL_ADMIN_EMAIL = originalEmail;
  env.INITIAL_ADMIN_PASSWORD = originalPassword;
  await ensureSeededDatabase(false);
  const restoredAdmin = await Admin.findOne({ isInitialAdmin: true }).select(
    '+passwordHash +isInitialAdmin'
  );
  assert.ok(restoredAdmin);
  assert.equal(String(restoredAdmin._id), initialAdminId);

  const staleCredentials = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: rotatedEmail, password: rotatedPassword },
  });
  assert.equal(staleCredentials.status, 401);
});

test('2. Authentication, RBAC & Session Security', async () => {
  const emptyLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: '', password: '' },
  });
  assert.equal(emptyLogin.status, 422);

  // Invalid credentials rejected
  const badLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: TEST_ADMIN_EMAIL, password: 'WrongPassword99' },
  });
  assert.equal(badLogin.status, 401);

  // Valid superadmin login
  const login = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: TEST_ADMIN_EMAIL, password: TEST_ADMIN_PASSWORD },
  });
  assert.equal(login.status, 200);
  assert.equal(login.body.success, true);
  assert.equal(login.body.data.token, undefined);
  assert.equal(login.body.data.authenticated, true);
  assert.equal('passwordHash' in login.body.data.admin, false);
  assert.match(login.headers.get('set-cookie') || '', /HttpOnly/i);
  superAdminToken = getAuthToken(login);

  // Editor login
  const edLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'editor-test@mahimdev.com', password: 'EditorPass@123' },
  });
  assert.equal(edLogin.status, 200);
  editorToken = getAuthToken(edLogin);

  // Unauthenticated access to protected route -> 401
  const unauthMe = await apiRequest('/api/v1/auth/me');
  assert.equal(unauthMe.status, 401);

  // Invalid JWT -> 401
  const tampered = await apiRequest('/api/v1/auth/me', { token: 'invalid.jwt.token' });
  assert.equal(tampered.status, 401);

  // Session check endpoint
  const sessionOk = await apiRequest('/api/v1/auth/session', { cookie: superAdminToken });
  assert.equal(sessionOk.status, 200);
  assert.equal(sessionOk.body.data.authenticated, true);
  const missingSession = await apiRequest('/api/v1/auth/session');
  assert.equal(missingSession.body.data.authenticated, false);

  // Update admin profile & verify MongoDB persistence
  const profUpdate = await apiRequest('/api/v1/auth/me', {
    method: 'PUT',
    token: superAdminToken,
    body: {
      name: 'Mahim Dev Verified',
      email: TEST_ADMIN_EMAIL,
      bio: 'Senior Full-Stack Engineer',
    },
  });
  assert.equal(profUpdate.status, 200);
  const dbAdmin = await Admin.findOne({ email: TEST_ADMIN_EMAIL });
  assert.equal(dbAdmin?.name, 'Mahim Dev Verified');

  // Password rotation invalidates pre-rotation tokens immediately
  const preRotationToken = superAdminToken;
  const rotateRes = await apiRequest('/api/v1/auth/change-password', {
    method: 'PUT',
    token: preRotationToken,
    body: {
      currentPassword: env.INITIAL_ADMIN_PASSWORD,
      newPassword: 'NewStrongPassword99',
    },
  });
  assert.equal(rotateRes.status, 200);
  assert.equal(rotateRes.body.data.token, undefined);
  const rotatedToken = getAuthToken(rotateRes);

  // Old token MUST fail with 401 PASSWORD_CHANGED
  const oldTokenAttempt = await apiRequest('/api/v1/auth/me', { token: preRotationToken });
  assert.equal(oldTokenAttempt.status, 401);
  assert.equal(oldTokenAttempt.body.error.code, 'PASSWORD_CHANGED');

  // Fresh token MUST succeed
  const freshTokenAttempt = await apiRequest('/api/v1/auth/me', { token: rotatedToken });
  assert.equal(freshTokenAttempt.status, 200);

  // Rotate back to initial password so downstream config stays consistent
  const restoreRes = await apiRequest('/api/v1/auth/change-password', {
    method: 'PUT',
    token: rotatedToken,
    body: {
      currentPassword: 'NewStrongPassword99',
      newPassword: env.INITIAL_ADMIN_PASSWORD,
    },
  });
  assert.equal(restoreRes.status, 200);
  superAdminToken = getAuthToken(restoreRes);

  const csrfRejected = await apiRequest('/api/v1/auth/logout', {
    method: 'POST',
    cookie: editorToken,
    headers: { Origin: 'https://untrusted.example' },
  });
  assert.equal(csrfRejected.status, 403);

  const logout = await apiRequest('/api/v1/auth/logout', {
    method: 'POST',
    cookie: editorToken,
    headers: { Origin: new URL(baseUrl).origin },
  });
  assert.equal(logout.status, 200);
  assert.match(logout.headers.get('set-cookie') || '', /mahim_admin_token=;/i);
  const revokedSession = await apiRequest('/api/v1/auth/me', { token: editorToken });
  assert.equal(revokedSession.status, 401);
  assert.equal(revokedSession.body.error.code, 'SESSION_REVOKED');

  const renewedEditorLogin = await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: { email: 'editor-test@mahimdev.com', password: 'EditorPass@123' },
  });
  editorToken = getAuthToken(renewedEditorLogin);
});

test('3. Projects CRUD, Draft Visibility, Partial Update Regression & Reorder', async () => {
  // Create draft project
  const createRes = await apiRequest('/api/v1/projects', {
    method: 'POST',
    token: superAdminToken,
    body: {
      title: 'Audit Cloud Commerce',
      category: 'E-Commerce',
      shortDescription: 'Isolated integration test storefront with distributed inventory.',
      overview: 'Comprehensive architectural case study overview.',
      thumbnail: '/src/assets/images/project_nextgen_mart_1793526368603.jpg',
      technologies: ['TypeScript', 'Node.js', 'MongoDB'],
      features: ['Distributed Cart', 'Webhook Sync'],
      challenges: 'High concurrency spikes',
      solutions: 'Optimistic locking & caching',
      results: '99.99% checkout uptime',
      liveUrl: 'https://example.com/demo',
      githubUrl: 'https://github.com/example/repo',
      featured: false,
      published: false,
    },
  });
  assert.equal(createRes.status, 201);
  const projectId = createRes.body.data._id;
  const projectSlug = createRes.body.data.slug;

  // Verify real DB persistence
  const savedDoc = await Project.findById(projectId);
  assert.ok(savedDoc);
  assert.deepEqual(savedDoc.technologies, ['TypeScript', 'Node.js', 'MongoDB']);
  assert.equal(savedDoc.published, false);

  // Draft must NOT be accessible publicly
  const publicFetchDraft = await apiRequest(`/api/v1/projects/${projectSlug}`);
  assert.equal(publicFetchDraft.status, 404);

  // Draft IS accessible to authenticated admin with includeDrafts=true
  const adminList = await apiRequest('/api/v1/projects?includeDrafts=true', {
    token: superAdminToken,
  });
  assert.equal(adminList.status, 200);
  assert.ok(adminList.body.data.some((p: any) => p._id === projectId));

  // CRITICAL REGRESSION TEST: Partial PUT { featured: true } must NOT wipe omitted fields or publish draft!
  const toggleFeaturedRes = await apiRequest(`/api/v1/projects/${projectId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { featured: true },
  });
  assert.equal(toggleFeaturedRes.status, 200);

  const afterPartialDoc = await Project.findById(projectId);
  assert.ok(afterPartialDoc);
  assert.equal(afterPartialDoc.featured, true);
  assert.equal(afterPartialDoc.published, false);
  assert.equal(afterPartialDoc.overview, 'Comprehensive architectural case study overview.');
  assert.deepEqual(afterPartialDoc.technologies, ['TypeScript', 'Node.js', 'MongoDB']);
  assert.deepEqual(afterPartialDoc.features, ['Distributed Cart', 'Webhook Sync']);
  assert.equal(afterPartialDoc.liveUrl, 'https://example.com/demo');

  // Publish project & verify public view counter increments in DB
  await apiRequest(`/api/v1/projects/${projectId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { published: true },
  });
  const pubVisit = await apiRequest(`/api/v1/projects/${projectSlug}`);
  assert.equal(pubVisit.status, 200);
  const viewedDoc = await Project.findById(projectId);
  assert.equal(viewedDoc?.views, 1);

  // Reorder validation: invalid ObjectId rejected with 400
  const badReorder = await apiRequest('/api/v1/projects/reorder', {
    method: 'PUT',
    token: superAdminToken,
    body: { orderedIds: ['not-an-object-id'] },
  });
  assert.equal(badReorder.status, 400);

  const goodReorder = await apiRequest('/api/v1/projects/reorder', {
    method: 'PUT',
    token: superAdminToken,
    body: { orderedIds: [projectId] },
  });
  assert.equal(goodReorder.status, 200);
  assert.equal((await Project.findById(projectId))?.order, 1);

  // RBAC: Editor cannot DELETE project (403 FORBIDDEN)
  const editorDelete = await apiRequest(`/api/v1/projects/${projectId}`, {
    method: 'DELETE',
    token: editorToken,
  });
  assert.equal(editorDelete.status, 403);

  // Superadmin deletes project & verify removal in MongoDB
  const adminDelete = await apiRequest(`/api/v1/projects/${projectId}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(adminDelete.status, 200);
  assert.equal(await Project.findById(projectId), null);
});

test('4. Services, About, Timeline & CV Download CRUD Persistence', async () => {
  // Services CRUD
  const createdSvc = await apiRequest('/api/v1/services', {
    method: 'POST',
    token: superAdminToken,
    body: {
      title: 'Audit API Architecture',
      icon: 'Server',
      shortDescription: 'Resilient REST & GraphQL backends built with TypeScript.',
      features: ['Zod Validation', 'Rate Limiting'],
      startingPrice: '$1,500',
    },
  });
  assert.equal(createdSvc.status, 201);
  const svcId = createdSvc.body.data._id;
  assert.ok(await Service.findById(svcId));

  // Partial update preserves features array
  const updSvc = await apiRequest(`/api/v1/services/${svcId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { startingPrice: '$1,800' },
  });
  assert.equal(updSvc.status, 200);
  const svcDoc = await Service.findById(svcId);
  assert.equal(svcDoc?.startingPrice, '$1,800');
  assert.deepEqual(svcDoc?.features, ['Zod Validation', 'Rate Limiting']);

  const delSvc = await apiRequest(`/api/v1/services/${svcId}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(delSvc.status, 200);
  assert.equal(await Service.findById(svcId), null);

  // About & Timeline CRUD
  const updAbout = await apiRequest('/api/v1/about', {
    method: 'PUT',
    token: superAdminToken,
    body: { trustText: 'Verified by automated integration suite' },
  });
  assert.equal(updAbout.status, 200);
  const aboutDoc = await About.findOne();
  assert.equal(aboutDoc?.trustText, 'Verified by automated integration suite');

  const createdTl = await apiRequest('/api/v1/about/timeline', {
    method: 'POST',
    token: superAdminToken,
    body: {
      year: '2026',
      title: 'Principal Systems Audit',
      subtitle: 'Enterprise Cloud',
      description: 'Led zero-downtime architecture audit across microservices.',
      category: 'career',
    },
  });
  assert.equal(createdTl.status, 201);
  const tlId = createdTl.body.data._id;

  const updTl = await apiRequest(`/api/v1/about/timeline/${tlId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { year: '2026 - Present' },
  });
  assert.equal(updTl.status, 200);
  assert.equal((await Timeline.findById(tlId))?.subtitle, 'Enterprise Cloud');

  const cvRes = await apiRequest('/api/v1/about/cv-download');
  assert.equal(cvRes.status, 200);
  assert.match(String(cvRes.body), /CAREER TIMELINE/);

  const delTl = await apiRequest(`/api/v1/about/timeline/${tlId}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(delTl.status, 200);
  assert.equal(await Timeline.findById(tlId), null);
});

test('5. Testimonials, Skills, Pricing, FAQs & SiteSettings CRUD Persistence', async () => {
  // Testimonial
  const tCreate = await apiRequest('/api/v1/testimonials', {
    method: 'POST',
    token: superAdminToken,
    body: {
      clientName: 'Alex Rivera',
      company: 'CloudScale',
      position: 'CTO',
      review: 'Exceptional engineering rigor and zero-defect delivery.',
      rating: 5,
    },
  });
  assert.equal(tCreate.status, 201);
  const tId = tCreate.body.data._id;
  await apiRequest(`/api/v1/testimonials/${tId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { position: 'VP Engineering' },
  });
  assert.equal((await Testimonial.findById(tId))?.company, 'CloudScale');
  assert.equal((await Testimonial.findById(tId))?.position, 'VP Engineering');
  await apiRequest(`/api/v1/testimonials/${tId}`, { method: 'DELETE', token: superAdminToken });
  assert.equal(await Testimonial.findById(tId), null);

  // Skill
  const skCreate = await apiRequest('/api/v1/skills', {
    method: 'POST',
    token: superAdminToken,
    body: {
      name: 'Playwright Automation',
      category: 'DevOps & Tools',
      proficiency: 94,
      description: 'End-to-end verification',
    },
  });
  assert.equal(skCreate.status, 201);
  const skId = skCreate.body.data._id;
  await apiRequest(`/api/v1/skills/${skId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { proficiency: 98 },
  });
  assert.equal((await Skill.findById(skId))?.description, 'End-to-end verification');
  assert.equal((await Skill.findById(skId))?.proficiency, 98);
  await apiRequest(`/api/v1/skills/${skId}`, { method: 'DELETE', token: superAdminToken });
  assert.equal(await Skill.findById(skId), null);

  // Pricing
  const prCreate = await apiRequest('/api/v1/pricing', {
    method: 'POST',
    token: superAdminToken,
    body: {
      packageName: 'Audit Retainer',
      price: '$2,400',
      billingType: 'Monthly',
      features: ['24/7 Monitoring', 'Security Hardening'],
    },
  });
  assert.equal(prCreate.status, 201);
  const prId = prCreate.body.data._id;
  await apiRequest(`/api/v1/pricing/${prId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { price: '$2,600' },
  });
  assert.deepEqual((await Pricing.findById(prId))?.features, [
    '24/7 Monitoring',
    'Security Hardening',
  ]);
  await apiRequest(`/api/v1/pricing/${prId}`, { method: 'DELETE', token: superAdminToken });
  assert.equal(await Pricing.findById(prId), null);

  // FAQ
  const fqCreate = await apiRequest('/api/v1/faq', {
    method: 'POST',
    token: superAdminToken,
    body: {
      question: 'Do you provide automated test coverage?',
      answer: 'Yes, unit, integration, and end-to-end suites are included.',
      category: 'Engineering',
    },
  });
  assert.equal(fqCreate.status, 201);
  const fqId = fqCreate.body.data._id;
  await apiRequest(`/api/v1/faq/${fqId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: { visible: false },
  });
  assert.equal((await FAQ.findById(fqId))?.category, 'Engineering');
  assert.equal((await FAQ.findById(fqId))?.visible, false);
  await apiRequest(`/api/v1/faq/${fqId}`, { method: 'DELETE', token: superAdminToken });
  assert.equal(await FAQ.findById(fqId), null);

  // Site Settings RBAC (editor blocked 403) & Partial Subdocument Merge Preservation
  const editorSettingsAttempt = await apiRequest('/api/v1/settings', {
    method: 'PUT',
    token: editorToken,
    body: { siteTitle: 'Unauthorized Change' },
  });
  assert.equal(editorSettingsAttempt.status, 403);

  const beforeSettings = await SiteSettings.findOne();
  const originalHeadline2 = beforeSettings?.banner?.headlineLine2;

  const partialBannerUpdate = await apiRequest('/api/v1/settings', {
    method: 'PUT',
    token: superAdminToken,
    body: {
      banner: { availabilityText: 'Open for Q4 Architecture Projects' },
      seo: { twitterHandle: '@mahimdev_verified' },
    },
  });
  assert.equal(partialBannerUpdate.status, 200);

  const afterSettings = await SiteSettings.findOne();
  assert.equal(afterSettings?.banner?.availabilityText, 'Open for Q4 Architecture Projects');
  assert.equal(afterSettings?.banner?.headlineLine2, originalHeadline2);
  assert.equal(afterSettings?.seo?.twitterHandle, '@mahimdev_verified');
});

test('6. Contact Inquiries, Live Unread Counts & Analytics Tracking', async () => {
  // Honeypot bot spam blocked with 422
  const spamAttempt = await apiRequest('/api/v1/messages', {
    method: 'POST',
    body: {
      fullName: 'Bot Spammer',
      email: 'bot@spam.example',
      subject: 'Spam Offer',
      message: 'Automated bot payload filling hidden honeypot.',
      honeypot: 'http://spam.example',
    },
  });
  assert.equal(spamAttempt.status, 422);

  // Valid inquiry creation
  const msgCreate = await apiRequest('/api/v1/messages', {
    method: 'POST',
    body: {
      fullName: 'Elena Rostova',
      email: 'elena@fintech.io',
      service: 'SaaS Applications',
      subject: 'Enterprise SaaS Rebuild',
      message: 'Looking to partner on our multi-tenant SaaS dashboard.',
    },
  });
  assert.equal(msgCreate.status, 201);
  const msgId = msgCreate.body.data.id;
  assert.ok(await Message.findById(msgId));
  const notification = await Notification.findOne({ eventKey: `contact-message:${msgId}` });
  assert.ok(notification);
  assert.equal(notification?.isRead, false);
  assert.equal(notification?.message, 'Elena Rostova: Enterprise SaaS Rebuild');

  const deniedNotifications = await apiRequest('/api/v1/notifications');
  assert.equal(deniedNotifications.status, 401);

  const notificationList = await apiRequest('/api/v1/notifications?page=1&limit=1', {
    token: superAdminToken,
  });
  assert.equal(notificationList.status, 200);
  assert.equal(notificationList.body.meta.total, 1);
  assert.equal(notificationList.body.meta.unreadCount, 1);
  assert.equal(notificationList.body.data[0]._id, String(notification?._id));

  const markedRead = await apiRequest(`/api/v1/notifications/${notification?._id}/read`, {
    method: 'PATCH',
    token: superAdminToken,
  });
  assert.equal(markedRead.status, 200);
  assert.equal(markedRead.body.data.isRead, true);

  const unreadCount = await apiRequest('/api/v1/notifications/unread-count', {
    token: superAdminToken,
  });
  assert.equal(unreadCount.body.data.unreadCount, 0);

  const invalidNotificationId = await apiRequest('/api/v1/notifications/not-an-id/read', {
    method: 'PATCH',
    token: superAdminToken,
  });
  assert.equal(invalidNotificationId.status, 400);

  const secondMessage = await apiRequest('/api/v1/messages', {
    method: 'POST',
    body: {
      fullName: 'Nadia Test',
      email: 'nadia@example.com',
      subject: 'Notification lifecycle test',
      message: 'A second inquiry checks mark-all-read behavior.',
    },
  });
  assert.equal(secondMessage.status, 201);
  const markAllRead = await apiRequest('/api/v1/notifications/read-all', {
    method: 'PATCH',
    token: superAdminToken,
  });
  assert.equal(markAllRead.status, 200);
  assert.equal(markAllRead.body.data.modifiedCount, 1);
  const secondNotification = await Notification.findOne({
    eventKey: `contact-message:${secondMessage.body.data.id}`,
  });
  assert.equal(secondNotification?.isRead, true);

  // Admin search & filter with malformed page param fallback
  const listRes = await apiRequest('/api/v1/messages?status=New&search=Elena&page=abc', {
    token: superAdminToken,
  });
  assert.equal(listRes.status, 200);
  assert.equal(listRes.body.meta.page, 1);
  assert.ok(listRes.body.data.some((m: any) => m._id === msgId));

  // Admin reply & live count return
  const replyRes = await apiRequest(`/api/v1/messages/${msgId}`, {
    method: 'PUT',
    token: superAdminToken,
    body: {
      replyBody: 'Hi Elena, thank you for reaching out! Let us schedule a call.',
      sendEmailReply: false,
    },
  });
  assert.equal(replyRes.status, 200);
  assert.equal(replyRes.body.data.status, 'Replied');
  assert.equal(typeof replyRes.body.meta.counts.unread, 'number');

  const delMsg = await apiRequest(`/api/v1/messages/${msgId}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(delMsg.status, 200);
  assert.equal(await Message.findById(msgId), null);
  const removedNotification = await apiRequest(
    `/api/v1/notifications/${notification?._id}`,
    { method: 'DELETE', token: superAdminToken }
  );
  assert.equal(removedNotification.status, 200);

  // Analytics tracking & overview
  const trackRes = await apiRequest('/api/v1/analytics/track', {
    method: 'POST',
    body: { path: '/projects', referrer: 'github.com', deviceType: 'desktop' },
  });
  assert.equal(trackRes.status, 201);
  assert.ok((await Analytics.countDocuments({ path: '/projects' })) >= 1);

  const homepageCount = await Analytics.countDocuments({ path: '/' });
  const homepageTrack = await apiRequest('/api/v1/analytics/track', {
    method: 'POST',
    body: { path: '/', referrer: 'Direct', deviceType: 'desktop' },
  });
  assert.equal(homepageTrack.status, 201);
  assert.equal(homepageTrack.body.data.recorded, true);
  assert.equal(await Analytics.countDocuments({ path: '/' }), homepageCount + 1);

  const duplicateHomepageTrack = await apiRequest('/api/v1/analytics/track', {
    method: 'POST',
    body: { path: '/', referrer: 'Direct', deviceType: 'desktop' },
  });
  assert.equal(duplicateHomepageTrack.status, 201);
  assert.equal(duplicateHomepageTrack.body.data.duplicate, true);
  assert.equal(await Analytics.countDocuments({ path: '/' }), homepageCount + 1);

  for (const body of [{ referrer: 'Direct' }, { path: 42 }, { path: null }]) {
    const invalidTrack = await apiRequest('/api/v1/analytics/track', {
      method: 'POST',
      body,
    });
    assert.equal(invalidTrack.status, 422);
    assert.equal(invalidTrack.body.error.code, 'VALIDATION_ERROR');
  }
  assert.equal(await Analytics.countDocuments({ path: '/' }), homepageCount + 1);

  const overview = await apiRequest('/api/v1/analytics/overview?days=invalid', {
    token: superAdminToken,
  });
  assert.equal(overview.status, 200);
  assert.equal(overview.body.data.days, 14);

  const visitors = await apiRequest('/api/v1/analytics/visitors?days=7', {
    token: superAdminToken,
  });
  assert.equal(visitors.status, 200);

  const pages = await apiRequest('/api/v1/analytics/pages?days=7', {
    token: superAdminToken,
  });
  assert.equal(pages.status, 200);
});

test('7. Media Upload Magic-Byte Verification, XSS URL Blocking & CORS Hardening', async () => {
  // 1) Spoofed HTML disguised as image/png MUST be rejected (400 INVALID_FILE_SIGNATURE)
  const spoofedForm = new FormData();
  const htmlBytes = new Blob(['<html><script>alert(1)</script></html>'], { type: 'image/png' });
  spoofedForm.append('file', htmlBytes, 'malicious.png');

  const spoofRes = await apiRequest('/api/v1/upload', {
    method: 'POST',
    token: superAdminToken,
    body: spoofedForm,
  });
  assert.equal(spoofRes.status, 400);
  assert.equal(spoofRes.body.error.code, 'INVALID_FILE_SIGNATURE');

  // 2) Authentic 1x1 PNG binary upload succeeds and persists in MediaAsset + /uploads
  const validPngBase64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';
  const pngBuffer = Buffer.from(validPngBase64, 'base64');
  const validForm = new FormData();
  validForm.append('file', new Blob([pngBuffer], { type: 'image/png' }), 'pixel.png');

  const uploadRes = await apiRequest('/api/v1/upload', {
    method: 'POST',
    token: superAdminToken,
    body: validForm,
  });
  assert.equal(uploadRes.status, 201);
  const assetId = uploadRes.body.data._id;
  const assetFilename = uploadRes.body.data.filename;
  const assetUrl = uploadRes.body.data.url;
  assert.ok(await MediaAsset.findById(assetId));

  // Verify served /uploads asset includes nosniff & sandbox CSP headers
  const servedUpload = await fetch(`${baseUrl}${assetUrl}`);
  assert.equal(servedUpload.status, 200);
  assert.equal(servedUpload.headers.get('x-content-type-options'), 'nosniff');
  assert.match(servedUpload.headers.get('content-security-policy') || '', /sandbox/);

  // Delete media asset & confirm DB record + local file are cleaned up
  const delAsset = await apiRequest(`/api/v1/upload/${assetId}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(delAsset.status, 200);
  assert.equal(await MediaAsset.findById(assetId), null);
  assert.equal(fs.existsSync(path.join(UPLOADS_DIR, assetFilename)), false);

  // 3) Stored XSS javascript: URL rejected with 422
  const xssProject = await apiRequest('/api/v1/projects', {
    method: 'POST',
    token: superAdminToken,
    body: {
      title: 'XSS Link Attempt',
      category: 'SaaS',
      shortDescription: 'Testing stored XSS link validation on project URLs.',
      thumbnail: '/uploads/test.jpg',
      liveUrl: 'javascript:alert(1)',
    },
  });
  assert.equal(xssProject.status, 422);

  // 4) Untrusted cross-origin CORS blocked, trusted localhost origin allowed
  const untrustedCors = await apiRequest('/api/v1/health', {
    headers: { Origin: 'https://evil-attacker.example' },
  });
  assert.equal(untrustedCors.headers.get('access-control-allow-origin'), null);

  const trustedCors = await apiRequest('/api/v1/health', {
    headers: { Origin: 'http://localhost:3000' },
  });
  assert.equal(trustedCors.headers.get('access-control-allow-origin'), 'http://localhost:3000');

  // 5) Invalid ObjectId -> 400, Non-existent ObjectId -> 404, Unknown API endpoint -> 404
  const castErr = await apiRequest('/api/v1/projects/invalid-oid', {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(castErr.status, 400);

  const missingObj = await apiRequest('/api/v1/projects/507f1f77bcf86cd799439011', {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(missingObj.status, 404);

  const unknownEndpoint = await apiRequest('/api/v1/non-existent-endpoint');
  assert.equal(unknownEndpoint.status, 404);
});

test('8. Newsletter Subscription & Footer Settings Database Persistence', async () => {
  // 1) Invalid email rejection
  const invalidEmailRes = await apiRequest('/api/v1/newsletter/subscribe', {
    method: 'POST',
    body: { email: 'not-an-email' },
  });
  assert.equal(invalidEmailRes.status, 400);

  // 2) Valid newsletter subscription
  const testEmail = 'subscriber.verified@example.com';
  const subRes = await apiRequest('/api/v1/newsletter/subscribe', {
    method: 'POST',
    body: { email: testEmail, source: 'footer_subscription' },
  });
  assert.equal(subRes.status, 201);
  assert.equal(subRes.body.success, true);
  const createdSubscriber = await NewsletterSubscriber.findOne({ email: testEmail });
  assert.ok(createdSubscriber);
  assert.equal(createdSubscriber.status, 'active');
  const subscriberNotification = await Notification.findOne({
    eventKey: `newsletter-subscription:${createdSubscriber?._id}`,
  });
  assert.equal(subscriberNotification?.type, 'newsletter_subscription');
  assert.equal(subscriberNotification?.message, 'A new subscriber joined the newsletter.');

  // 3) Duplicate subscription check
  const dupRes = await apiRequest('/api/v1/newsletter/subscribe', {
    method: 'POST',
    body: { email: testEmail },
  });
  assert.equal(dupRes.status, 200);
  assert.equal(dupRes.body.data.alreadySubscribed, true);

  // 4) Admin subscriber listing
  const listRes = await apiRequest('/api/v1/newsletter/subscribers', {
    token: superAdminToken,
  });
  assert.equal(listRes.status, 200);
  assert.ok(listRes.body.data.some((s: any) => s.email === testEmail));

  // 5) Admin deletion of subscriber
  const delSubRes = await apiRequest(`/api/v1/newsletter/subscribers/${createdSubscriber._id}`, {
    method: 'DELETE',
    token: superAdminToken,
  });
  assert.equal(delSubRes.status, 200);
  assert.equal(await NewsletterSubscriber.findById(createdSubscriber._id), null);

  // 6) Footer settings update, database persistence, and public availability
  const updateFooterRes = await apiRequest('/api/v1/settings', {
    method: 'PUT',
    token: superAdminToken,
    body: {
      footerTagline: 'Architecting Scalable Web Ecosystems',
      footer: {
        tagline: 'Architecting Scalable Web Ecosystems',
        description: 'Updated brand description verified through MongoDB integration test.',
        appDownload: {
          enabled: true,
          title: 'Experience on Mobile',
          subtitle: 'Optimized PWA and Native builds',
          playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mahimdev.app',
          appStoreUrl: 'https://apps.apple.com/app/mahimdev/id123456789',
          showBadges: true,
        },
        newsletter: {
          badgeText: 'VIP Dispatch',
          headline: 'Get weekly architectural insights',
          description: 'Deep dives into distributed systems and frontend craft.',
          buttonText: 'Join Dispatch',
        },
        trustStrip: {
          visible: true,
          items: [
            { icon: 'ShieldCheck', title: 'Security-Minded', description: 'Audited code' },
            { icon: 'Zap', title: '24/7 Uptime', description: 'Reliable cloud systems' },
            { icon: 'Sparkles', title: 'Premium Craft', description: 'Zero-slop UI' },
            { icon: 'Award', title: 'Trusted Delivery', description: 'Verified results' },
          ],
        },
        showWaves: true,
        showSkyline: true,
      },
    },
  });
  assert.equal(updateFooterRes.status, 200);

  // Verify in MongoDB directly
  const savedSettings = await SiteSettings.findOne();
  assert.equal(savedSettings?.footer?.tagline, 'Architecting Scalable Web Ecosystems');
  assert.equal(savedSettings?.footer?.newsletter?.badgeText, 'VIP Dispatch');
  assert.equal(savedSettings?.footer?.trustStrip?.items?.length, 4);

  // Verify public retrieval of settings contains updated footer config
  const publicSettingsRes = await apiRequest('/api/v1/settings');
  assert.equal(publicSettingsRes.status, 200);
  assert.equal(publicSettingsRes.body.data.footer.tagline, 'Architecting Scalable Web Ecosystems');
});
