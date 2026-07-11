import requestLib from 'got';
import throttled from './throttle.js';
import { CookieJar } from 'tough-cookie';
import createDebug from 'debug';

const cookieJar = new CookieJar();
const debug = createDebug('google-play-scraper');

class RequestError extends Error {
  status?: number;
  constructor (message: string, status?: number) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}

interface RequestOptions extends Record<string, unknown> {
  url?: string;
  cookieJar?: CookieJar;
}

function doRequest (opts: RequestOptions, limit?: number): Promise<string> {
  opts.cookieJar = cookieJar;

  const req = limit
    ? throttled(requestLib as unknown as (opts: RequestOptions) => Promise<{ body: string }>, { interval: 1000, limit })
    : requestLib;

  return new Promise<string>((resolve, reject) => {
    (req as unknown as (opts: RequestOptions) => Promise<{ body: string }>)(opts)
      .then((response: { body: string }) => resolve(response.body))
      .catch((error: Error) => reject(error));
  });
}

async function request (opts: RequestOptions, limit?: number): Promise<string> {
  debug('Making request: %j', opts);
  try {
    const response = await doRequest(opts, limit);
    debug('Request finished');
    return response;
  // TS 6.0 mandates catch type must be unknown or any
  } catch (reason: unknown) {
    const error = reason as Error & { response?: { statusCode: number } };
    debug('Request error:', error.message, error.response?.statusCode);

    let message = 'Error requesting Google Play:' + error.message;
    if (error.response?.statusCode === 404) {
      message = 'App not found (404)';
    }
    throw new RequestError(message, error.response?.statusCode);
  }
}

export default request;
