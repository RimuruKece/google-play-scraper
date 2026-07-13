import request from './utils/request.js';
import scriptData from './utils/script-data.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/process-pages.js';
import { listItemMappings } from './utils/mappings.js';
import createDebug from 'debug';
import type { AppListItem, ScrapedData } from './types.js';
import type { ParsedData } from './utils/script-data.js';
import { path } from './utils/path.js';

const debug = createDebug('google-play-scraper:similar');

interface SimilarOptions {
  appId: string;
  lang?: string;
  country?: string;
  fullDetail?: boolean;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

async function similar (opts: SimilarOptions): Promise<AppListItem[]> {
  validateSimilarParameters(opts);

  const mergedOpts = Object.assign({},
    {
      appId: encodeURIComponent(opts.appId),
      lang: opts.lang || 'en',
      country: opts.country || 'us',
      fullDetail: opts.fullDetail
    });

  const qs = new URLSearchParams({
    id: mergedOpts.appId,
    hl: 'en',
    gl: mergedOpts.country!
  }).toString();

  const similarUrl = `${BASE_URL}/store/apps/details?${qs}`;
  const options = Object.assign({
    url: similarUrl,
    followRedirect: true
  }, opts.requestOptions);

  debug('Similar Request URL: %s', similarUrl);

  const html = await request(options, opts.throttle);
  const parsed = scriptData.parse(html);
  return parseSimilarApps(parsed, mergedOpts);
}

function validateSimilarParameters (opts: SimilarOptions): void {
  if (!opts.appId) {
    throw new Error('appId missing');
  }
}

const INITIAL_MAPPINGS = {
  apps: ['ds:3', 0, 1, 0, 21, 0] as (string | number)[],
  token: ['ds:3', 0, 1, 0, 21, 1, 3, 1] as (string | number)[]
};

const CLUSTER_MAPPING = {
  title: [21, 1, 0],
  url: [21, 1, 2, 4, 2]
};

const SIMILAR_APPS = 'Similar apps';
const SIMILAR_GAMES = 'Similar games';

function findClusters(parsedData: ParsedData): ScrapedData[] | undefined {
  for (const key of Object.keys(parsedData)) {
    if (key === 'serviceRequestData') continue;
    const data = parsedData[key];
    const clusters = path<ScrapedData[]>([1, 1], data);
    if (Array.isArray(clusters) && clusters.length > 0) {
      const hasSimilar = clusters.some(cluster => {
        const title = path(CLUSTER_MAPPING.title, cluster);
        return title === SIMILAR_APPS || title === SIMILAR_GAMES;
      });
      if (hasSimilar) {
        return clusters;
      }
    }
  }

  for (const key of Object.keys(parsedData)) {
    if (key === 'serviceRequestData') continue;
    const data = parsedData[key];
    const clusters = path<ScrapedData[]>([1, 1], data);
    if (Array.isArray(clusters) && clusters.length > 0) {
      const hasUrl = clusters.some(cluster => path(CLUSTER_MAPPING.url, cluster));
      if (hasUrl) {
        return clusters;
      }
    }
  }
  return undefined;
}

async function parseSimilarApps (similarObject: ParsedData, opts: SimilarOptions): Promise<AppListItem[]> {
  const clusters = findClusters(similarObject);

  if (!clusters || clusters.length === 0) {
    throw new Error('Similar apps not found');
  }

  let similarAppsCluster = clusters.filter((cluster) => {
    return path(CLUSTER_MAPPING.title, cluster) === SIMILAR_APPS ||
      path(CLUSTER_MAPPING.title, cluster) === SIMILAR_GAMES;
  });

  if (similarAppsCluster.length === 0) {
    similarAppsCluster = clusters;
  }

  const clusterUrl = getParsedCluster(similarAppsCluster[0]);

  const fullClusterUrl = `${BASE_URL}${clusterUrl}&gl=${opts.country}&hl=${opts.lang}`;
  debug('Cluster Request URL: %s', fullClusterUrl);

  const options = Object.assign({
    url: fullClusterUrl,
    followRedirect: true
  }, opts.requestOptions);

  const html = await request(options, opts.throttle);
  const htmlParsed = scriptData.parse(html);
  return processFirstPage(htmlParsed, opts, [], INITIAL_MAPPINGS);
}

async function processFirstPage (html: ScrapedData, opts: SimilarOptions, savedApps: AppListItem[], _mappings: typeof INITIAL_MAPPINGS): Promise<AppListItem[]> {
  if (typeof html === 'string') {
    html = scriptData.parse(html as string);
  }

  const mapping = listItemMappings(true);

  // Dynamically resolve ds key if ds:3 is not present or yields no apps
  let dsKey = 'ds:3';
  let processedApps = scriptData.extractApps<AppListItem>(mapping, html, [dsKey, 0, 1, 0, 21, 0]);
  if (processedApps.length === 0 && typeof html === 'object' && html !== null) {
    for (const key of Object.keys(html)) {
      if (key.startsWith('ds:') && key !== 'ds:3') {
        const candidate = scriptData.extractApps<AppListItem>(mapping, html, [key, 0, 1, 0, 21, 0]);
        if (candidate.length > 0) {
          dsKey = key;
          processedApps = candidate;
          break;
        }
      }
    }
  }

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts) as unknown as AppListItem[]
    : processedApps;
  const token = path([dsKey, 0, 1, 0, 21, 1, 3, 1], html) as string | undefined;

  return checkFinished(opts, [...savedApps, ...apps], token) as Promise<AppListItem[]>;
}

function getParsedCluster (similarObject: ScrapedData): string {
  const clusterUrl = path(CLUSTER_MAPPING.url, similarObject) as string;
  return clusterUrl;
}

export default similar;
