import request from './utils/request.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/process-pages.js';
import scriptData from './utils/script-data.js';
import { listItemMappings } from './utils/mappings.js';
import type { AppListItem, ScrapedData } from './types.js';
import { path } from './utils/path.js';

interface SearchOptions {
  term: string;
  lang?: string;
  country?: string;
  num?: number;
  fullDetail?: boolean;
  price?: string;
  throttle?: number;
  cache?: boolean;
  requestOptions?: Record<string, unknown>;
}

interface Mappings {
  app: (string | number)[];
  sections: (string | number)[];
}

async function initialRequest (opts: SearchOptions): Promise<AppListItem[]> {
  const searchUrl = `${BASE_URL}/store/search?c=apps&q=${opts.term}&hl=${opts.lang!}&gl=${opts.country!}&price=${opts.price!}`;
  const html = await request(
    Object.assign({ url: searchUrl }, opts.requestOptions),
    opts.throttle
  );
  return processFirstPage(html, opts, [], INITIAL_MAPPINGS);
}

const EXACT_MATCH_MAPPING = {
  title: [16, 2, 0, 0],
  appId: [16, 3, 12, 0, 0],
  url: {
    path: [17, 0, 0, 4, 2],
    fun: (path: string) => new URL(path, BASE_URL).toString()
  },
  icon: [16, 2, 95, 0, 3, 2],
  developer: [16, 2, 68, 0],
  developerId: {
    path: [16, 2, 68, 1, 4, 2],
    fun: (link: string) => link ? link.split('?id=')[1] : undefined
  },
  currency: [17, 0, 2, 0, 1, 0, 1],
  price: {
    path: [17, 0, 2, 0, 1, 0, 0],
    fun: (price: number) => price / 1000000
  },
  free: {
    path: [17, 0, 2, 0, 1, 0, 0],
    fun: (price: number) => price === 0
  },
  summary: [16, 2, 73, 0, 1],
  scoreText: [16, 2, 51, 0, 0],
  score: [16, 2, 51, 0, 1]
};

async function processFirstPage (html: ScrapedData, opts: SearchOptions, savedApps: AppListItem[], mappings: Mappings): Promise<AppListItem[]> {
  if (typeof html === 'string') {
    html = scriptData.parse(html as string);
  }

  const appsMapping = {
    ...listItemMappings(),
    developerId: [0, 14]
  };

  const sections = path(mappings.sections, html) as unknown[] || [];
  if (sections.length === 0) return [];

  let appsSection: ScrapedData = null;
  let tokenValue: string | null = null;

  for (const section of sections) {
    const apps = path(SECTIONS_MAPPING.apps, section);
    if (Array.isArray(apps) && (apps as unknown[]).length > 0) {
      appsSection = apps;
      tokenValue = path(SECTIONS_MAPPING.token, section) as string | null;
      break;
    }
  }

  if (!appsSection) return [];

  const processedApps = scriptData.extractApps<AppListItem>(appsMapping, appsSection, []);

  const exactMatchData = path(mappings.app, html) as ScrapedData;
  if (exactMatchData) {
    const exactMatch = scriptData.extractor(EXACT_MATCH_MAPPING)(exactMatchData);
    if ((exactMatch as unknown as AppListItem).appId && !processedApps.some((a: AppListItem) => a.appId === (exactMatch as unknown as AppListItem).appId)) {
      processedApps.unshift(exactMatch as unknown as AppListItem);
    }
  }

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts) as unknown as AppListItem[]
    : processedApps;

  return checkFinished(opts, [...savedApps, ...apps], tokenValue ?? undefined) as Promise<AppListItem[]>;
}

const INITIAL_MAPPINGS = {
  app: ['ds:4', 0, 1, 0, 23] as (string | number)[],
  sections: ['ds:4', 0, 1] as (string | number)[]
};

const SECTIONS_MAPPING = {
  apps: [22, 0] as (string | number)[],
  token: [22, 1, 3, 1] as (string | number)[]
};

function getPriceGoogleValue (value: string): number {
  switch (value.toLowerCase()) {
    case 'free':
      return 1;
    case 'paid':
      return 2;
    case 'all':
    default:
      return 0;
  }
}

async function search (appData: (opts: Record<string, unknown>) => Promise<unknown>, opts: SearchOptions): Promise<AppListItem[]> {
  if (!opts || !opts.term) {
    throw new Error('Search term missing');
  }

  if (opts.num && opts.num > 250) {
    throw new Error("The number of results can't exceed 250");
  }

  const normalized: SearchOptions = {
    term: encodeURIComponent(opts.term),
    lang: opts.lang || 'en',
    country: opts.country || 'us',
    num: opts.num || 20,
    fullDetail: opts.fullDetail,
    price: String(opts.price ? getPriceGoogleValue(opts.price) : 0),
    throttle: opts.throttle,
    cache: opts.cache,
    requestOptions: opts.requestOptions
  };

  const results = await initialRequest(normalized);

  if (normalized.fullDetail) {
    return Promise.all(
      results.map((app: AppListItem) => appData({ ...normalized, appId: app.appId }) as Promise<unknown>)
    ) as Promise<AppListItem[]>;
  }
  return results;
}

export default search;
