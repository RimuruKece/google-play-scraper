import scriptData from './utils/script-data.js';
import { BASE_URL } from './constants.js';
import request from './utils/request.js';
import { checkFinished, processFullDetailApps } from './utils/process-pages.js';
import { listItemMappings } from './utils/mappings.js';
import createDebug from 'debug';
import type { AppListItem, ScrapedData } from './types.js';
import { path } from './utils/path.js';

const debug = createDebug('google-play-scraper:developer');

interface DeveloperOptions {
  devId: string;
  lang?: string;
  country?: string;
  num?: number;
  fullDetail?: boolean;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

function buildUrl (opts: DeveloperOptions): string {
  const { lang, devId, country } = opts;
  const urlStr = `${BASE_URL}/store/apps`;
  const path = isNaN(Number(opts.devId))
    ? '/developer'
    : '/dev';

  const queryString = {
    id: devId,
    hl: lang!,
    gl: country!
  };

  const fullURL = `${urlStr}${path}?${new URLSearchParams(queryString).toString()}`;

  debug('Initial request: %s', fullURL);

  return fullURL;
}

async function developer (opts: DeveloperOptions): Promise<AppListItem[]> {
  if (!opts.devId) {
    throw new Error('devId missing');
  }

  opts = Object.assign({
    num: 60,
    lang: 'en',
    country: 'us'
  }, opts);

  const options = Object.assign({
    url: buildUrl(opts),
    method: 'GET' as const,
    followRedirect: true
  }, opts.requestOptions);

  const html = await request(options, opts.throttle);
  const parsed = scriptData.parse(html);
  return parseDeveloperApps(parsed, opts);
}

async function parseDeveloperApps (html: ScrapedData, opts: DeveloperOptions): Promise<AppListItem[]> {
  if (typeof html === 'string') {
    html = scriptData.parse(html as string);
  }

  const initialMappings = isNaN(Number(opts.devId))
    ? {
        apps: ['ds:3', 0, 1, 0, 22, 0] as (string | number)[],
        token: ['ds:3', 0, 1, 0, 22, 1, 3, 1] as (string | number)[]
      }
    : {
        apps: ['ds:3', 0, 1, 0, 21, 0] as (string | number)[],
        token: ['ds:3', 0, 1, 0, 21, 1, 3, 1] as (string | number)[]
      };

  const appsMappings = listItemMappings(!isNaN(Number(opts.devId)));

  const processedApps = scriptData.extractApps<AppListItem>(appsMappings, html, initialMappings.apps);
  const apps: AppListItem[] = opts.fullDetail
    ? await processFullDetailApps(processedApps, opts) as unknown as AppListItem[]
    : processedApps;

  const token = path(initialMappings.token, html) as string | undefined;

  return checkFinished(opts, apps, token) as unknown as Promise<AppListItem[]>;
}

export default developer;
