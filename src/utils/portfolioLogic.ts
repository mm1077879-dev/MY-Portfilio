import type { ProjectItem } from '../types/portfolio';

export const PUBLIC_PROJECT_FILTERS = [
  'All Projects',
  'E-Commerce',
  'SaaS',
  'Web Apps',
  'Dashboards',
  'Business Sites',
] as const;

export type PublicProjectFilter = (typeof PUBLIC_PROJECT_FILTERS)[number];

/**
 * Filters projects by category tab and free-text query across title, description, and tech stack.
 */
export function filterProjectsList(
  projects: ProjectItem[],
  activeCategory: string,
  searchQuery: string
): ProjectItem[] {
  const normalizedSearch = searchQuery.trim().toLowerCase();

  return projects.filter((project) => {
    const matchesCategory =
      !activeCategory ||
      activeCategory === 'All' ||
      activeCategory === 'All Projects' ||
      (activeCategory === 'Business Sites' && project.category === 'Business') ||
      project.category === activeCategory;

    if (!matchesCategory) return false;
    if (!normalizedSearch) return true;

    const inTitle = project.title.toLowerCase().includes(normalizedSearch);
    const inDesc = project.shortDescription.toLowerCase().includes(normalizedSearch);
    const inTech = project.technologies.some((t) =>
      t.toLowerCase().includes(normalizedSearch)
    );
    const inCat = project.category.toLowerCase().includes(normalizedSearch);

    return inTitle || inDesc || inTech || inCat;
  });
}

/**
 * Splits a comma or newline separated string into a clean deduplicated string array.
 */
export function parseDelimitedList(raw: string): string[] {
  if (!raw) return [];
  const items = raw
    .split(/[\n,]+/)
    .map((entry) => entry.trim())
    .filter(Boolean);
  return Array.from(new Set(items));
}

/**
 * Formats an array of strings into a comma-separated string for form editing.
 */
export function formatDelimitedList(items: string[] | undefined): string {
  if (!items || items.length === 0) return '';
  return items.join(', ');
}

/**
 * Normalizes a WhatsApp phone number or link into a clickable https://wa.me/... URL.
 */
export function normalizeWhatsAppHref(raw: string | undefined): string {
  if (!raw) return 'https://wa.me/15552348910';
  const trimmed = raw.trim();
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.toString();
      }
    } catch {
      // Fall back to digit extraction below
    }
  }
  const digits = trimmed.replace(/[^0-9]/g, '');
  return digits ? `https://wa.me/${digits}` : 'https://wa.me/15552348910';
}

/**
 * Builds a clean, branded document title per route.
 */
export function buildPageDocumentTitle(pathname: string, baseSiteTitle: string): string {
  const brand = baseSiteTitle.split('—')[0]?.trim() || 'Mahim Dev';
  if (pathname === '/') return baseSiteTitle || 'Mahim Dev — Full-Stack Developer';
  if (pathname === '/projects') return `Projects & Case Studies — ${brand}`;
  if (pathname.startsWith('/projects/')) return `Case Study — ${brand}`;
  if (pathname === '/services') return `Services & Workflow — ${brand}`;
  if (pathname === '/about') return `About ${brand} — Full-Stack Developer`;
  if (pathname === '/contact') return `Contact ${brand} — Start Your Project`;
  if (pathname.startsWith('/admin')) return `Admin CMS — ${brand}`;
  return baseSiteTitle;
}

/**
 * Detects viewport device class for privacy-conscious analytics.
 */
export function detectViewportDevice(width: number): 'desktop' | 'tablet' | 'mobile' {
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Checks if a destination URL is an invalid placeholder or example domain.
 */
export function isPlaceholderOrExampleUrl(url?: string): boolean {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim().toLowerCase();
  return (
    trimmed === '' ||
    trimmed === '#' ||
    trimmed.includes('example.com') ||
    trimmed.includes('example.org') ||
    trimmed.includes('example.net') ||
    trimmed.includes('iana.org')
  );
}

/**
 * Resolves safe project live destination to prevent IANA example-domain navigation errors.
 */
export function resolveProjectLiveDestination(project: {
  slug?: string;
  _id?: string;
  liveUrl?: string;
}): { isExternal: boolean; destination: string } {
  const internalPath = `/projects/${project.slug || project._id}`;
  if (!project.liveUrl || isPlaceholderOrExampleUrl(project.liveUrl)) {
    return { isExternal: false, destination: internalPath };
  }
  const isExternal =
    project.liveUrl.startsWith('http://') || project.liveUrl.startsWith('https://');
  return { isExternal, destination: isExternal ? project.liveUrl : internalPath };
}

