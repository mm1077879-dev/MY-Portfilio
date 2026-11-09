import test from 'node:test';
import assert from 'node:assert/strict';
import {
  filterProjectsList,
  parseDelimitedList,
  normalizeWhatsAppHref,
  buildPageDocumentTitle,
  detectViewportDevice,
  isPlaceholderOrExampleUrl,
  resolveProjectLiveDestination,
} from './portfolioLogic';
import type { ProjectItem } from '../types/portfolio';

const mockProjects: ProjectItem[] = [
  {
    _id: '1',
    title: 'NextGen Mart',
    slug: 'nextgen-mart',
    category: 'E-Commerce',
    shortDescription: 'Modern storefront with Stripe checkout.',
    overview: '',
    thumbnail: '/img1.jpg',
    screenshots: [],
    technologies: ['Next.js', 'MongoDB', 'Stripe'],
    features: ['Fast Performance'],
    challenges: '',
    solutions: '',
    results: '',
    liveUrl: '',
    caseStudyUrl: '',
    githubUrl: '',
    featured: true,
    published: true,
    order: 1,
    views: 10,
    createdAt: '',
    updatedAt: '',
  },
  {
    _id: '2',
    title: 'BizGrow',
    slug: 'bizgrow',
    category: 'Business',
    shortDescription: 'Corporate growth website.',
    overview: '',
    thumbnail: '/img2.jpg',
    screenshots: [],
    technologies: ['React', 'Tailwind CSS'],
    features: ['SEO Optimized'],
    challenges: '',
    solutions: '',
    results: '',
    liveUrl: '',
    caseStudyUrl: '',
    githubUrl: '',
    featured: true,
    published: true,
    order: 2,
    views: 5,
    createdAt: '',
    updatedAt: '',
  },
];

test('filterProjectsList filters by Business Sites alias and tech search', () => {
  const businessOnly = filterProjectsList(mockProjects, 'Business Sites', '');
  assert.equal(businessOnly.length, 1);
  assert.equal(businessOnly[0].slug, 'bizgrow');

  const stripeMatch = filterProjectsList(mockProjects, 'All Projects', 'stripe');
  assert.equal(stripeMatch.length, 1);
  assert.equal(stripeMatch[0].slug, 'nextgen-mart');
});

test('parseDelimitedList cleans and deduplicates comma/newline lists', () => {
  assert.deepEqual(
    parseDelimitedList('React, TypeScript,  React , \nMongoDB '),
    ['React', 'TypeScript', 'MongoDB']
  );
});

test('normalizeWhatsAppHref converts raw numbers, preserves https links, and blocks unsafe schemes', () => {
  assert.equal(normalizeWhatsAppHref('+880 1711-223344'), 'https://wa.me/8801711223344');
  assert.equal(normalizeWhatsAppHref('https://wa.me/1555000'), 'https://wa.me/1555000');
  assert.equal(normalizeWhatsAppHref('javascript:alert(1)'), 'https://wa.me/1');
  assert.equal(normalizeWhatsAppHref(''), 'https://wa.me/15552348910');
});

test('buildPageDocumentTitle resolves clean route titles', () => {
  assert.equal(
    buildPageDocumentTitle('/services', 'Mahim Dev — Full-Stack Developer'),
    'Services & Workflow — Mahim Dev'
  );
  assert.equal(
    buildPageDocumentTitle('/projects/nextgen-mart', 'Mahim Dev — Full-Stack Developer'),
    'Case Study — Mahim Dev'
  );
});

test('detectViewportDevice classifies responsive widths accurately', () => {
  assert.equal(detectViewportDevice(390), 'mobile');
  assert.equal(detectViewportDevice(820), 'tablet');
  assert.equal(detectViewportDevice(1440), 'desktop');
});

test('isPlaceholderOrExampleUrl detects example domains and empty links', () => {
  assert.equal(isPlaceholderOrExampleUrl('https://example.com/demo'), true);
  assert.equal(isPlaceholderOrExampleUrl('https://example.org'), true);
  assert.equal(isPlaceholderOrExampleUrl('https://iana.org/help/example-domains'), true);
  assert.equal(isPlaceholderOrExampleUrl(''), true);
  assert.equal(isPlaceholderOrExampleUrl(undefined), true);
  assert.equal(isPlaceholderOrExampleUrl('https://real-live-site.com'), false);
  assert.equal(isPlaceholderOrExampleUrl('/projects/nextgen-mart'), false);
});

test('resolveProjectLiveDestination safely routes placeholder URLs to internal case studies', () => {
  const placeholderProject = {
    _id: 'proj-1',
    slug: 'nextgen-mart',
    liveUrl: 'https://example.com/nextgen-mart-demo',
  };
  const resolved = resolveProjectLiveDestination(placeholderProject);
  assert.equal(resolved.isExternal, false);
  assert.equal(resolved.destination, '/projects/nextgen-mart');

  const realExternalProject = {
    _id: 'proj-2',
    slug: 'taskflow-pro',
    liveUrl: 'https://taskflow.io',
  };
  const resolvedExternal = resolveProjectLiveDestination(realExternalProject);
  assert.equal(resolvedExternal.isExternal, true);
  assert.equal(resolvedExternal.destination, 'https://taskflow.io');
});

