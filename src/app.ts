import request from './utils/request.js';
import scriptData from './utils/script-data.js';
import { BASE_URL } from './constants.js';
import helper from './utils/mapping-helpers.js';
import createDebug from 'debug';
import type { AppItemFullDetail, ScrapedData } from './types.js';
import { fetchAuroraOSS, getAuroraConfig, AuroraDevice } from './utils/aurora-oss.js';
import { path } from './utils/path.js';

const debug = createDebug('google-play-scraper:app');

const PLAYSTORE_URL = `${BASE_URL}/store/apps/details`;

interface AppOptions {
  appId: string;
  lang?: string;
  country?: string;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
  auroraDevice?: AuroraDevice;
  auroraDeviceFile?: string;
  [key: string]: unknown;
}

interface MappingSpec {
  path?: (string | number)[];
  fallbackPath?: (string | number)[];
  fun?: (val: ScrapedData, data?: ScrapedData) => unknown;
  useServiceRequestId?: string;
}

type Mappings = Record<string, (string | number)[] | MappingSpec>;

async function app (opts: AppOptions): Promise<AppItemFullDetail> {
  if (!opts.appId) {
    throw new Error('appId missing');
  }

  opts.lang = opts.lang || 'en';
  opts.country = opts.country || 'us';

  const params = new URLSearchParams({
    id: opts.appId,
    hl: opts.lang!,
    gl: opts.country!
  });
  const reqUrl = `${PLAYSTORE_URL}?${params}`;

  const options = Object.assign({
    url: reqUrl,
    followRedirect: true
  }, opts.requestOptions);

  const response = await request(options, opts.throttle);
  const parsed = scriptData.parse(response);
  const data = scriptData.extractor(MAPPINGS)(parsed) as Record<string, unknown>;

  // Fallback to AuroraOSS if version info is variable and credentials are provided
  if (
    (data.version === 'VARY' || data.androidVersion === 'VARY' || data.androidVersionText === 'Varies with device') &&
    getAuroraConfig() !== null
  ) {
    try {
      const auroraData = await fetchAuroraOSS(opts.appId, {
        device: opts.auroraDevice,
        deviceFile: opts.auroraDeviceFile
      });
      if (auroraData) {
        data.version = auroraData.version;
        data.androidVersion = auroraData.androidVersion;
        data.androidVersionText = auroraData.androidVersionText;
      }
    } catch (err: unknown) {
      debug('AuroraOSS fallback failed: %o', err);
    }
  }

  return Object.assign(data, { appId: opts.appId, url: reqUrl }) as unknown as AppItemFullDetail;
}

const MAPPINGS = {
  title: ['ds:5', 1, 2, 0, 0],
  description: {
    path: ['ds:5', 1, 2],
    fun: (val: ScrapedData) => helper.descriptionText(helper.descriptionHtmlLocalized(val) || '')
  },
  descriptionHTML: {
    path: ['ds:5', 1, 2],
    fun: helper.descriptionHtmlLocalized
  },
  summary: ['ds:5', 1, 2, 73, 0, 1],
  installs: ['ds:5', 1, 2, 13, 0],
  minInstalls: ['ds:5', 1, 2, 13, 1],
  maxInstalls: ['ds:5', 1, 2, 13, 2],
  score: ['ds:5', 1, 2, 51, 0, 1],
  scoreText: ['ds:5', 1, 2, 51, 0, 0],
  ratings: ['ds:5', 1, 2, 51, 2, 1],
  reviews: ['ds:5', 1, 2, 51, 3, 1],
  histogram: {
    path: ['ds:5', 1, 2, 51, 1],
    fun: helper.buildHistogram
  },
  price: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 0],
    fun: (val: number) => val / 1000000 || 0
  },
  originalPrice: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 1, 0],
    fun: (price: number) => price ? price / 1000000 : undefined
  },
  discountEndDate: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 14, 1],
  free: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 0],
    fun: (val: number) => val === 0
  },
  currency: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 1],
  priceText: {
    path: ['ds:5', 1, 2, 57, 0, 0, 0, 0, 1, 0, 2],
    fun: helper.priceText
  },
  available: {
    path: ['ds:5', 1, 2, 18, 0],
    fun: Boolean
  },
  offersIAP: {
    path: ['ds:5', 1, 2, 19, 0],
    fun: Boolean
  },
  IAPRange: ['ds:5', 1, 2, 19, 0],
  androidVersion: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 0, 1],
    fallbackPath: ['ds:5', 1, 2, -1, '141', 1, 1, 0, 0, 1],
    fun: helper.normalizeAndroidVersion
  },
  androidVersionText: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 0, 1],
    fallbackPath: ['ds:5', 1, 2, -1, '141', 1, 1, 0, 0, 1],
    fun: (version: string) => version || 'Varies with device'
  },
  androidMaxVersion: {
    path: ['ds:5', 1, 2, 140, 1, 1, 0, 1, 1],
    fallbackPath: ['ds:5', 1, 2, -1, '141', 1, 1, 0, 1, 1],
    fun: helper.normalizeAndroidVersion
  },
  developer: ['ds:5', 1, 2, 68, 0],
  developerId: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl: string) => devUrl.split('id=')[1]
  },
  developerEmail: ['ds:5', 1, 2, 69, 1, 0],
  developerWebsite: ['ds:5', 1, 2, 69, 0, 5, 2],
  developerAddress: ['ds:5', 1, 2, 69, 2, 0],
  developerLegalName: ['ds:5', 1, 2, 69, 4, 0],
  developerLegalEmail: ['ds:5', 1, 2, 69, 4, 1, 0],
  developerLegalAddress: {
    path: ['ds:5', 1, 2, 69],
    fun: (searchArray: ScrapedData) => {
      return path([4, 2, 0], searchArray)?.toString().replace(/\n/g, ', ');
    }
  },
  developerLegalPhoneNumber: ['ds:5', 1, 2, 69, 4, 3],
  privacyPolicy: ['ds:5', 1, 2, 99, 0, 5, 2],
  developerInternalID: {
    path: ['ds:5', 1, 2, 68, 1, 4, 2],
    fun: (devUrl: string) => devUrl.split('id=')[1]
  },
  genre: ['ds:5', 1, 2, 79, 0, 0, 0],
  genreId: ['ds:5', 1, 2, 79, 0, 0, 2],
  categories: {
    path: ['ds:5', 1, 2],
    fun: (searchArray: ScrapedData) => {
      const categories = helper.extractCategories(path([118], searchArray) as ScrapedData);
      if (categories.length === 0) {
        categories.push({
          name: path([79, 0, 0, 0], searchArray) as string,
          id: path([79, 0, 0, 2], searchArray) as string | null
        });
      }
      return categories;
    }
  },
  icon: ['ds:5', 1, 2, 95, 0, 3, 2],
  headerImage: ['ds:5', 1, 2, 96, 0, 3, 2],
  screenshots: {
    path: ['ds:5', 1, 2, 78, 0],
    fun: (screenshots: ScrapedData) => {
      const arr = screenshots as unknown[] | undefined;
      if (!arr?.length) return [];
      return arr.map((item) => path([3, 2], item));
    }
  },
  video: ['ds:5', 1, 2, 100, 0, 0, 3, 2],
  videoImage: ['ds:5', 1, 2, 100, 1, 0, 3, 2],
  previewVideo: ['ds:5', 1, 2, 100, 1, 2, 0, 2],
  contentRating: ['ds:5', 1, 2, 9, 0],
  contentRatingDescription: ['ds:5', 1, 2, 9, 2, 1],
  adSupported: {
    path: ['ds:5', 1, 2, 48],
    fun: Boolean
  },
  released: ['ds:5', 1, 2, 10, 0],
  updated: {
    path: ['ds:5', 1, 2, 145, 0, 1, 0],
    fallbackPath: ['ds:5', 1, 2, -1, '146', 0, 1, 0],
    fun: (ts: number) => ts * 1000
  },
  version: {
    path: ['ds:5', 1, 2, 140, 0, 0, 0],
    fallbackPath: ['ds:5', 1, 2, -1, '141', 0, 0, 0],
    fun: (val: string) => val || 'VARY'
  },
  recentChanges: {
    path: ['ds:5', 1, 2, 144, 1, 1],
    fallbackPath: ['ds:5', 1, 2, -1, '145', 1, 1],
    fun: (val: string) => val
  },
  comments: {
    path: [] as (string | number)[],
    fun: helper.extractComments
  },
  preregister: {
    path: ['ds:5', 1, 2, 18, 0],
    fun: (val: number) => val === 1
  },
  earlyAccessEnabled: {
    path: ['ds:5', 1, 2, 18, 2],
    fun: (val: ScrapedData) => typeof val === 'string'
  },
  isAvailableInPlayPass: {
    path: ['ds:5', 1, 2, 62],
    fun: (field: ScrapedData) => !!field
  }
} as Mappings;

export default app;
