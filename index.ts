import { partial } from 'ramda';
import { constants } from './lib/constants.js';
import memoizee from 'memoizee';
import appMethod from './lib/app.js';

import list from './lib/list.js';
import search from './lib/search.js';
import suggest from './lib/suggest.js';
import developer from './lib/developer.js';
import reviews from './lib/reviews.js';
import similar from './lib/similar.js';
import permissions from './lib/permissions.js';
import datasafety from './lib/datasafety.js';
import categories from './lib/categories.js';
import type { AppItem, AppItemFullDetail, AppListItem } from './types.js';

const methods = {
  app: appMethod,
  list,
  search: partial(search, [appMethod]),
  suggest,
  developer,
  reviews,
  similar,
  permissions,
  datasafety,
  categories
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
  memoized: (opts?: MemoizedOptions) => Omit<ScraperMethods, 'memoized'> & typeof constants;
}

type MemoizedReturn = Omit<ScraperMethods, 'memoized'> & typeof constants;
type Scraper = ScraperMethods & typeof constants;

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
    search: memoize(partial(search, [mAppMethod]) as SearchPartial),
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

const scraper: Scraper = { ...constants, ...methods, memoized };

export default scraper;
export type {
  AppItem,
  AppItemFullDetail,
  AppListItem
};
