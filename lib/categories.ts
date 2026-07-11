import request from './utils/request.js';
import * as cheerio from 'cheerio';
import { BASE_URL } from './constants.js';

const PLAYSTORE_URL = `${BASE_URL}/store/apps`;
const CATEGORY_URL_PREFIX = '/store/apps/category/';

interface CategoriesOptions {
  throttle?: number;
  requestOptions?: Record<string, unknown>;
}

async function categories (opts?: CategoriesOptions): Promise<string[]> {
  const options = Object.assign(
    {
      url: PLAYSTORE_URL
    },
    opts?.requestOptions
  );

  const html = await request(options, opts?.throttle);
  const $ = cheerio.load(html);
  return extractCategories($);
}

function extractCategories ($: cheerio.CheerioAPI): string[] {
  const categoryIds = $('ul li a')
    .toArray()
    .map((el) => $(el).attr('href'))
    .filter((url): url is string => url !== undefined && url.startsWith(CATEGORY_URL_PREFIX) && !url.includes('?age='))
    .map((url) => url.substring(CATEGORY_URL_PREFIX.length));
  categoryIds.push('APPLICATION');

  return categoryIds;
}

export default categories;
