import request from './utils/request.js';
import scriptData from './utils/script-data.js';
import { BASE_URL, constants } from './constants.js';
import createDebug from 'debug';

import type { ScrapedData } from './types.js';
import { path } from './utils/path.js';

const debug = createDebug('google-play-scraper:permissions');

interface PermissionsOptions {
  appId: string;
  lang?: string;
  country?: string;
  short?: boolean;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

interface PermissionItem {
  permission: string;
  type: string;
}

async function permissions (opts: PermissionsOptions): Promise<string[] | PermissionItem[]> {
  if (!opts.appId) {
    throw new Error('appId missing');
  }

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';

  return processPermissions(opts);
}

async function processPermissions (opts: PermissionsOptions): Promise<string[] | PermissionItem[]> {
  const body = `f.req=%5B%5B%5B%22xdSrCf%22%2C%22%5B%5Bnull%2C%5B%5C%22${opts.appId}%5C%22%2C7%5D%2C%5B%5D%5D%5D%22%2Cnull%2C%221%22%5D%5D%5D`;
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

  if (data === null) {
    return [];
  }

  return (opts.short)
    ? processShortPermissionsData(data)
    : processPermissionData(data);
}

const MAPPINGS = {
  permissions: [2],
  type: 0
};

function processShortPermissionsData (html: ScrapedData): string[] {
  const commonPermissions = (html as ScrapedData[])[constants.permission.COMMON] as ScrapedData[];

  if (!commonPermissions) {
    return [];
  }

  const validPermissions = commonPermissions.filter((permission) => (permission as ScrapedData[]).length);
  return validPermissions.map((permission) => (permission as ScrapedData[])[MAPPINGS.type] as string);
}

function processPermissionData (html: ScrapedData): PermissionItem[] {
  debug('html %o', html);

  const permissions = Object.values(constants.permission).reduce<PermissionItem[]>((permissionAccummulator, permission) => {
    const htmlArr = html as unknown[];
    const permissionGroup = htmlArr[permission] as unknown[];
    if (!permissionGroup) {
      return permissionAccummulator;
    }

    permissionAccummulator.push(
      ...permissionGroup.flatMap((p) => flatMapPermissions(p as ScrapedData))
    );

    return permissionAccummulator;
  }, []);

  debug('Permissions %o', permissions);

  return permissions;
}

function flatMapPermissions (permission: ScrapedData): PermissionItem[] {
  const input = path(MAPPINGS.permissions, permission) as ScrapedData[] | undefined;

  if (typeof input === 'undefined') {
    return [];
  }

  const mappings = getPermissionMappings((permission as unknown[])[MAPPINGS.type] as string);
  return input.map(scriptData.extractor(mappings)) as unknown as PermissionItem[];
}

function getPermissionMappings (type: string) {
  return {
    permission: [1],
    type: {
      path: [0],
      fun: () => type
    }
  };
}

export default permissions;
