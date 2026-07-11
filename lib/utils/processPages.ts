import * as R from 'ramda';
import request from './request.js';
import scriptData from './scriptData.js';
import appList from './appList.js';
import { BASE_URL } from '../constants.js';
import appDetails from '../app.js';
import createDebug from 'debug';
import type { ScrapedData, AppItemFullDetail, AppListItem } from '../../types.js';

const debug = createDebug('google-play-scraper:processPages');

interface ProcessOpts {
  num?: number;
  fullDetail?: boolean;
  lang?: string;
  country?: string;
  cache?: boolean;
  throttle?: number;
  numberOfApps?: number;
  requestOptions?: Record<string, unknown>;
}

interface PageMappings {
  apps: (string | number)[];
  token: (string | number)[];
}

async function processPages <T> (html: string | ScrapedData, opts: ProcessOpts, savedApps: T[], mappings: PageMappings): Promise<T[]> {
  if (R.is(String, html)) {
    html = scriptData.parse(html as string);
  }

  const processedApps = appList.extract(mappings.apps, html as ScrapedData) as T[];
  // processFullDetailApps requires AppListItem; cast is safe here since fullDetail
  // is only true on initial calls, not recursive pagination
  const apps = opts.fullDetail
    ? await processFullDetailApps(processedApps as unknown as AppListItem[], opts) as unknown as T[]
    : processedApps;
  const token = R.path(mappings.token, html) as string | undefined;

  return checkFinished(opts, [...savedApps, ...apps], token);
}

async function processFullDetailApps (apps: AppListItem[], opts: ProcessOpts): Promise<AppItemFullDetail[]> {
  const promises = apps.map(a => (
    appDetails({
      appId: a.appId,
      lang: opts.lang,
      country: opts.country,
      cache: opts.cache,
      throttle: opts.throttle,
      requestOptions: opts.requestOptions
    })
  ));

  return Promise.all(promises);
}

const REQUEST_MAPPINGS: PageMappings = {
  apps: [0, 0, 0],
  token: [0, 0, 7, 1]
};

async function checkFinished <T> (opts: ProcessOpts, savedApps: T[], nextToken?: string): Promise<T[]> {
  if ((savedApps.length >= (opts.num ?? Infinity)) || !nextToken) {
    return savedApps.slice(0, opts.num);
  }

  const body = getBodyForRequests({
    numberOfApps: opts.numberOfApps,
    withToken: nextToken
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${opts.lang}&gl=${opts.country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const requestOptions = Object.assign({
    url,
    method: 'POST' as const,
    body,
    followRedirect: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  const html = await request(requestOptions, opts.throttle);
  const data = scriptData.parseBatchExecute(html);
  return (data === null)
    ? savedApps
    : processPages(data, opts, savedApps, REQUEST_MAPPINGS);
}

interface BodyRequestOpts {
  numberOfApps?: number;
  withToken?: string;
}

function getBodyForRequests ({
  numberOfApps = 100,
  withToken = '%token%'
}: BodyRequestOpts = {}): string {
  const body = `f.req=%5B%5B%5B%22qnKhOb%22%2C%22%5B%5Bnull%2C%5B%5B10%2C%5B10%2C${numberOfApps}%5D%5D%2Ctrue%2Cnull%2C%5B96%2C27%2C4%2C8%2C57%2C30%2C110%2C79%2C11%2C16%2C49%2C1%2C3%2C9%2C12%2C104%2C55%2C56%2C51%2C10%2C34%2C77%5D%5D%2Cnull%2C%5C%22${withToken}%5C%22%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`;
  return body;
}

export { processPages, processFullDetailApps, checkFinished };
