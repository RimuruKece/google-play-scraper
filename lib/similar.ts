import * as R from 'ramda';
import request from './utils/request.js';
import queryString from 'querystring';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import { processFullDetailApps, checkFinished } from './utils/processPages.js';
import { listItemMappings } from './utils/mappings.js';
import createDebug from 'debug';
import type { AppListItem, ScrapedData } from '../types.js';
import type { ParsedData } from './utils/scriptData.js';

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

  const qs = queryString.stringify({
    id: mergedOpts.appId,
    hl: 'en',
    gl: mergedOpts.country
  });

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
    throw Error('appId missing');
  }
}

const INITIAL_MAPPINGS = {
  clusters: {
    path: [1, 1],
    useServiceRequestId: 'ag2B9c'
  },
  apps: ['ds:3', 0, 1, 0, 21, 0] as (string | number)[],
  token: ['ds:3', 0, 1, 0, 21, 1, 3, 1] as (string | number)[]
};

const CLUSTER_MAPPING = {
  title: [21, 1, 0],
  url: [21, 1, 2, 4, 2]
};

const SIMILAR_APPS = 'Similar apps';
const SIMILAR_GAMES = 'Similar games';

async function parseSimilarApps (similarObject: ParsedData, opts: SimilarOptions): Promise<AppListItem[]> {
  const clusters = scriptData.extractDataWithServiceRequestId(similarObject as ParsedData, INITIAL_MAPPINGS.clusters) as ScrapedData[];

  if (clusters.length === 0) {
    throw Error('Similar apps not found');
  }

  let similarAppsCluster = clusters.filter((cluster) => {
    return R.path(CLUSTER_MAPPING.title, cluster) === SIMILAR_APPS ||
      R.path(CLUSTER_MAPPING.title, cluster) === SIMILAR_GAMES;
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

async function processFirstPage (html: ScrapedData, opts: SimilarOptions, savedApps: AppListItem[], mappings: typeof INITIAL_MAPPINGS): Promise<AppListItem[]> {
  if (R.is(String, html)) {
    html = scriptData.parse(html as string);
  }

  const mapping = listItemMappings(true);

  const processedApps = scriptData.extractApps<AppListItem>(mapping, html, mappings.apps);

  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts) as unknown as AppListItem[]
    : processedApps;
  const token = R.path(mappings.token, html) as string | undefined;

  return checkFinished(opts, [...savedApps, ...apps], token) as Promise<AppListItem[]>;
}

function getParsedCluster (similarObject: ScrapedData): string {
  const clusterUrl = R.path(CLUSTER_MAPPING.url, similarObject) as string;
  return clusterUrl;
}

export default similar;
