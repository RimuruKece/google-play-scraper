import requestLib from 'got';
import throttled from './throttle.js';
import { CookieJar } from 'tough-cookie';
import createDebug from 'debug';

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

async function request (opts: RequestOptions, limit?: number): Promise<string> {
  // Create a fresh jar per request unless one is provided — avoids shared state
  const jar = opts.cookieJar ?? new CookieJar();
  opts.cookieJar = jar;
  debug('Making request: %j', opts);

  try {
    const req = limit
      ? throttled(requestLib as unknown as (opts: RequestOptions) => Promise<{ body: string }>, { interval: 1000, limit })
      : requestLib;

    const response = await (req as unknown as (opts: RequestOptions) => Promise<{ body: string }>)(opts);
    debug('Request finished');
    return response.body;
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
