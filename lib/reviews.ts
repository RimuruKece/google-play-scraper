import * as R from 'ramda';
import request from './utils/request.js';
import scriptData from './utils/scriptData.js';
import { BASE_URL, constants } from './constants.js';
import createDebug from 'debug';
import type { ScrapedData } from '../types.js';

const debug = createDebug('google-play-scraper:reviews');

interface ReviewsOptions {
  appId: string;
  sort?: number;
  lang?: string;
  country?: string;
  num?: number;
  paginate?: boolean;
  nextPaginationToken?: string | null;
  throttle?: number;
  requestOptions?: Record<string, unknown>;
  requestType?: string;
}

interface ReviewItem {
  id: string;
  userName: string;
  userImage: string;
  date: string;
  score: number;
  scoreText: string;
  url: string;
  title: string | null;
  text: string;
  replyDate: string | null;
  replyText: string | null;
  version: string | null;
  thumbsUp: number;
  criterias: Array<{ criteria: string; rating: number | null }>;
}

interface ReviewsResult {
  data: ReviewItem[];
  nextPaginationToken: string | null;
}

async function reviews (opts: ReviewsOptions): Promise<ReviewsResult> {
  validate(opts);
  const fullOptions = Object.assign({
    sort: constants.sort.NEWEST,
    lang: 'en',
    country: 'us',
    num: 150,
    paginate: false,
    nextPaginationToken: null
  }, opts);

  return processReviews(fullOptions);
}

function validate (opts: ReviewsOptions): void {
  if (!opts.appId) {
    throw Error('appId missing');
  }

  if (opts.sort && !R.includes(opts.sort, R.values(constants.sort))) {
    throw new Error('Invalid sort ' + opts.sort);
  }
}

function formatReviewsResponse ({
  reviews,
  num,
  token = null
}: {
  reviews: ReviewItem[];
  num: number;
  token?: string | null;
}): ReviewsResult {
  const reviewsToResponse = (reviews.length >= num)
    ? reviews.slice(0, num)
    : reviews;

  return {
    data: reviewsToResponse,
    nextPaginationToken: token
  };
}

const REQUEST_TYPE = {
  initial: 'initial',
  paginated: 'paginated'
};

interface BodyRequestOpts {
  appId: string;
  sort: number;
  numberOfReviewsPerRequest?: number;
  withToken?: string;
  requestType?: string;
}

function getBodyForRequests ({
  appId,
  sort,
  numberOfReviewsPerRequest = 150,
  withToken = '%token%',
  requestType = REQUEST_TYPE.initial
}: BodyRequestOpts): string {
  const formBody: Record<string, string> = {
    [REQUEST_TYPE.initial]: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviewsPerRequest}%2Cnull%2Cnull%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`,
    [REQUEST_TYPE.paginated]: `f.req=%5B%5B%5B%22UsvDTd%22%2C%22%5Bnull%2Cnull%2C%5B2%2C${sort}%2C%5B${numberOfReviewsPerRequest}%2Cnull%2C%5C%22${withToken}%5C%22%5D%2Cnull%2C%5B%5D%5D%2C%5B%5C%22${appId}%5C%22%2C7%5D%5D%22%2Cnull%2C%22generic%22%5D%5D%5D`
  };

  return formBody[requestType];
}

const REQUEST_MAPPINGS = {
  reviews: [0],
  token: [1, 1]
};

async function processReviewsAndGetNextPage (html: ScrapedData, opts: ReviewsOptions, savedReviews: ReviewItem[]): Promise<ReviewsResult> {
  const processAndRecurOptions = Object.assign({}, opts, { requestType: REQUEST_TYPE.paginated });
  const { appId, paginate, num } = processAndRecurOptions;
  const parsedHtml = R.is(String, html)
    ? scriptData.parse(html as string)
    : html;

  if ((parsedHtml as unknown[]).length === 0) {
    return formatReviewsResponse({ reviews: savedReviews, token: null, num: num! });
  }

  const reviews = extract(REQUEST_MAPPINGS.reviews, parsedHtml, appId);
  const token = R.path(REQUEST_MAPPINGS.token, parsedHtml) as string | null;
  const reviewsAccumulator = [...savedReviews, ...reviews];

  return (!paginate && token && reviewsAccumulator.length < num!)
    ? makeReviewsRequest(processAndRecurOptions, reviewsAccumulator, token)
    : formatReviewsResponse({ reviews: reviewsAccumulator, token, num: num! });
}

async function makeReviewsRequest (opts: ReviewsOptions, savedReviews: ReviewItem[], nextToken: string): Promise<ReviewsResult> {
  debug('nextToken: %s', nextToken);
  debug('savedReviews length: %s', savedReviews.length);
  debug('requestType: %s', opts.requestType);

  const {
    appId,
    sort,
    requestType,
    lang,
    country,
    requestOptions,
    throttle,
    num
  } = opts;
  const body = getBodyForRequests({
    appId: appId!,
    sort: sort!,
    withToken: nextToken,
    requestType
  });
  const url = `${BASE_URL}/_/PlayStoreUi/data/batchexecute?rpcids=qnKhOb&f.sid=-697906427155521722&bl=boq_playuiserver_20190903.08_p0&hl=${lang}&gl=${country}&authuser&soc-app=121&soc-platform=1&soc-device=1&_reqid=1065213`;

  debug('batchexecute URL: %s', url);
  debug('with body: %s', body);

  const reviewRequestOptions = Object.assign({
    url,
    method: 'POST' as const,
    body,
    followRedirect: true,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
    }
  }, requestOptions);

  const html = await request(reviewRequestOptions, throttle);
  const data = scriptData.parseBatchExecute(html);

  return (data === null)
    ? formatReviewsResponse({ reviews: savedReviews, token: null, num: num! })
    : processReviewsAndGetNextPage(data, opts, savedReviews);
}

function processReviews (opts: ReviewsOptions): Promise<ReviewsResult> {
  const requestType = (!opts.nextPaginationToken)
    ? REQUEST_TYPE.initial
    : REQUEST_TYPE.paginated;
  const token = opts.nextPaginationToken || '%token%';

  const reviewsOptions = Object.assign({}, { requestType }, opts);
  return makeReviewsRequest(reviewsOptions, [], token);
}

const REVIEWS_BASE_MAPPINGS = {
  id: [0],
  userName: [1, 0],
  userImage: [1, 1, 3, 2],
  date: { path: [5], fun: generateDate },
  score: [2],
  scoreText: { path: [2], fun: (score: number) => String(score) },
  title: { path: [0], fun: () => null },
  text: [4],
  replyDate: { path: [7, 2], fun: generateDate },
  replyText: { path: [7, 1], fun: (text: string | undefined) => text || null },
  version: { path: [10], fun: (version: string | undefined) => version || null },
  thumbsUp: [6],
  criterias: { path: [12, 0], fun: (criterias: ScrapedData[] = []) => criterias.map(buildCriteria) }
};

const buildCriteria = (criteria: ScrapedData) => {
  const c = criteria as ScrapedData[];
  return {
    criteria: c[0] as string,
    rating: c[1] ? (c[1] as unknown[])[0] as number | null : null
  };
};

function generateDate (dateArray: number[] | undefined): string | null {
  if (!dateArray) {
    return null;
  }

  const millisecondsLastDigits = String(dateArray[1] || '000');
  const millisecondsTotal = `${dateArray[0]}${millisecondsLastDigits.substring(0, 3)}`;
  const date = new Date(Number(millisecondsTotal));

  return date.toJSON();
}

function extract (root: (string | number)[], data: ScrapedData, appId: string): ReviewItem[] {
  const input = R.path(root, data) as ScrapedData[] | undefined;
  const mappings = {
    ...REVIEWS_BASE_MAPPINGS,
    url: { path: [0], fun: (reviewId: string) => `${BASE_URL}/store/apps/details?id=${appId}&reviewId=${reviewId}` }
  };
  return R.map(scriptData.extractor(mappings), input || []) as unknown as ReviewItem[];
}

export default reviews;
