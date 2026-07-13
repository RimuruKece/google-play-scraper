import { constants } from './constants.js';
import memoizee from 'memoizee';
import appMethod from './app.js';

import list from './list.js';
import search from './search.js';
import suggest from './suggest.js';
import developer from './developer.js';
import reviews from './reviews.js';
import similar from './similar.js';
import permissions from './permissions.js';
import datasafety from './datasafety.js';
import categories from './categories.js';
import { setAuroraOSS, AuroraDevice } from './utils/aurora-oss.js';
import type { AppItem, AppItemFullDetail, AppListItem } from './types.js';

const methods = {
  app: appMethod,
  list,
  search: (opts: Parameters<typeof search>[1]) => search(appMethod as (opts: Record<string, unknown>) => Promise<unknown>, opts),
  suggest,
  developer,
  reviews,
  similar,
  permissions,
  datasafety,
  categories,
  setAuroraOSS
};

interface MemoizedOptions {
  primitive?: boolean;
  normalizer?: (args: Parameters<typeof JSON.stringify>[0]) => string;
  maxAge?: number;
  max?: number;
}

type SearchPartial = (opts: Parameters<typeof search>[1]) => ReturnType<typeof search>;

interface ScraperMethods {
  app: typeof appMethod;
  list: typeof list;
  search: SearchPartial;
  suggest: typeof suggest;
  developer: typeof developer;
  reviews: typeof reviews;
  similar: typeof similar;
  permissions: typeof permissions;
  datasafety: typeof datasafety;
  categories: typeof categories;
  setAuroraOSS: typeof setAuroraOSS;
  memoized: (opts?: MemoizedOptions) => Omit<ScraperMethods, 'memoized' | 'setAuroraOSS'> & typeof constants;
}

type MemoizedReturn = Omit<ScraperMethods, 'memoized' | 'setAuroraOSS'> & typeof constants;
type Scraper = ScraperMethods & typeof constants & { AuroraDevice: typeof AuroraDevice };

function memoized (opts?: MemoizedOptions): MemoizedReturn {
  const cacheOpts = Object.assign({
    primitive: true,
    normalizer: JSON.stringify,
    maxAge: 1000 * 60 * 5,
    max: 1000
  }, opts);

  const mAppMethod = memoizee(appMethod, cacheOpts) as typeof appMethod;

  const memoize = <T extends (...args: never[]) => unknown>(fn: T): T => memoizee(fn, cacheOpts) as T;

  const otherMethods = {
    list: memoize(list),
    search: memoize(((opts: Parameters<typeof search>[1]) => search(mAppMethod as (opts: Record<string, unknown>) => Promise<unknown>, opts)) as SearchPartial),
    suggest: memoize(suggest),
    developer: memoize(developer),
    reviews: memoize(reviews),
    similar: memoize(similar),
    permissions: memoize(permissions),
    datasafety: memoize(datasafety),
    categories: memoize(categories)
  };

  return { app: mAppMethod, ...constants, ...otherMethods };
}

const scraper: Scraper = { ...constants, ...methods, memoized, AuroraDevice };

export default scraper;
export { AuroraDevice };
export type {
  AppItem,
  AppItemFullDetail,
  AppListItem
};

