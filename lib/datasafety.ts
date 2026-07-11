import * as R from 'ramda';
import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';

import type { ScrapedData } from '../types.js';

interface DataSafetyOptions {
  appId: string;
  lang?: string;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

interface DataEntry {
  data: string;
  optional: boolean;
  purpose: string;
  type: string;
}

interface SecurityPractice {
  practice: string;
  description: string;
}

interface DataSafetyResult {
  sharedData: DataEntry[];
  collectedData: DataEntry[];
  securityPractices: SecurityPractice[];
  privacyPolicyUrl: string;
}

async function dataSafety (opts: DataSafetyOptions): Promise<DataSafetyResult> {
  if (!opts.appId) {
    throw Error('appId missing');
  }

  opts.lang = opts.lang || 'en';

  return processDataSafety(opts);
}

async function processDataSafety (opts: DataSafetyOptions): Promise<DataSafetyResult> {
  const PLAYSTORE_URL = `${BASE_URL}/store/apps/datasafety`;

  const searchParams = new URLSearchParams({
    id: opts.appId!,
    hl: opts.lang!
  });
  const reqUrl = `${PLAYSTORE_URL}?${searchParams}`;

  const options = Object.assign({
    url: reqUrl,
    followRedirect: true
  }, opts.requestOptions);

  const html = await request(options, opts.throttle);
  const parsed = scriptData.parse(html);
  return scriptData.extractor(MAPPINGS)(parsed) as unknown as DataSafetyResult;
}

const MAPPINGS = {
  sharedData: {
    path: ['ds:3', 1, 2, 1, 138, 4, 0, 0],
    fun: mapDataEntries
  },
  collectedData: {
    path: ['ds:3', 1, 2, 1, 138, 4, 1, 0],
    fun: mapDataEntries
  },
  securityPractices: {
    path: ['ds:3', 1, 2, 1, 138, 9, 2],
    fun: mapSecurityPractices
  },
  privacyPolicyUrl: ['ds:3', 1, 2, 1, 100, 0, 5, 2]
};

function mapSecurityPractices (practices: ScrapedData): SecurityPractice[] {
  const arr = practices as ScrapedData[];
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.map((practice) => ({
    practice: R.path([1], practice) as string,
    description: R.path([2, 1], practice) as string
  }));
}

function mapDataEntries (dataEntries: ScrapedData): DataEntry[] {
  const arr = dataEntries as ScrapedData[];
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr.flatMap((data) => {
    const type = R.path([0, 1], data) as string;
    const details = R.path([4], data) as ScrapedData[] || [];

    return details.map((detail) => ({
      data: R.path([0], detail) as string,
      optional: Boolean(R.path([1], detail)),
      purpose: R.path([2], detail) as string,
      type
    }));
  });
}

export default dataSafety;
