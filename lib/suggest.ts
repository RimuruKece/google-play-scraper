import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL } from './constants.js';
import type { ScrapedData } from '../types.js';

interface SuggestOptions {
  term: string;
  lang?: string;
  country?: string;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

async function suggest (opts: SuggestOptions): Promise<string[]> {
  if (!opts.term) {
    throw Error('term missing');
  }

  const lang = opts.lang || 'en';
  const country = opts.country || 'us';
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=IJ4APc&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${lang}&gl=${country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  const term = encodeURIComponent(opts.term);
  const body = `f.req=%5B%5B%5B%22IJ4APc%22%2C%22%5B%5Bnull%2C%5B%5C%22${term}%5C%22%5D%2C%5B10%5D%2C%5B2%5D%2C4%5D%5D%22%5D%5D%5D`;
  const options = Object.assign({
    url,
    body,
    method: 'POST' as const,
    followAllRedirects: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, opts.requestOptions);

  const html = await request(options, opts.throttle);
  const data = scriptData.parseBatchExecute(html);

  if (data === null) {
    return [];
  }
  const suggestions = (data as unknown[][])[0][0] as ScrapedData[];
  return suggestions.map((s) => (s as string[])[0]);
}

export default suggest;
