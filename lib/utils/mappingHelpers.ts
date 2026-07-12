import { load as parseHtml } from 'cheerio';
import * as R from 'ramda';
import type { ScrapedData } from '../../types.js';

function descriptionHtmlLocalized (searchArray: ScrapedData): string | undefined {
  const descriptionTranslation = R.path([12, 0, 0, 1], searchArray) as string | undefined;
  const descriptionOriginal = R.path([72, 0, 1], searchArray) as string | undefined;
  return descriptionTranslation || descriptionOriginal;
}

function descriptionText (description: string): string {
  const html = parseHtml('<div>' + description.replace(/<br>/g, '\r\n') + '</div>');
  return html('div').text();
}

function priceText (priceText: string | undefined): string {
  return priceText || 'Free';
}

function normalizeAndroidVersion (androidVersionText: string | undefined): string {
  if (!androidVersionText) return 'VARY';
  const number = androidVersionText.split(' ')[0];
  if (parseFloat(number)) {
    return number;
  }
  return 'VARY';
}

function buildHistogram (container: ScrapedData | undefined): Record<number, number> {
  const c = container as Record<number, ScrapedData[]> | undefined;
  if (!c) {
    return { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  }
  return {
    1: (c[1]?.[1] as number) ?? 0,
    2: (c[2]?.[1] as number) ?? 0,
    3: (c[3]?.[1] as number) ?? 0,
    4: (c[4]?.[1] as number) ?? 0,
    5: (c[5]?.[1] as number) ?? 0
  };
}

function extractComments (data: ScrapedData): string[] {
  let comments: ScrapedData[] = [];

  for (const path of ['ds:8', 'ds:9']) {
    if (R.path([path, 0, 0, 1, 0], data) && R.path([path, 0, 0, 10], data) && R.path([path, 0, 0, 5, 0], data)) {
      comments = (R.path([path, 0], data) as ScrapedData[]) || [];
      break;
    }
  }

  if (comments.length > 0) {
    comments = comments.slice(0, 5).map((c: ScrapedData) => (c as ScrapedData[])[4]);
  }

  return comments as string[];
}

interface Feature {
  title: string;
  description: string;
}

function extractFeatures (featuresArray: ScrapedData): Feature[] {
  const fa = featuresArray as ScrapedData[];
  if (!fa) {
    return [];
  }

  const features: ScrapedData[] = fa[2] as ScrapedData[] || [];
  return features.map((feature) => ({
    title: (feature as ScrapedData[])[0] as string,
    description: R.path([1, 0, 0, 1], feature) as string
  }));
}

interface CategoryEntry {
  name: string;
  id: string | null;
}

function extractCategories (searchArray: ScrapedData, categories: CategoryEntry[] = []): CategoryEntry[] {
  const arr = searchArray as ScrapedData[];
  if (!Array.isArray(arr) || arr.length === 0) return categories;

  if (arr.length >= 4 && typeof arr[0] === 'string') {
    categories.push({
      name: arr[0] as string,
      id: arr[2] as string | null
    });
  } else {
    arr.forEach((sub) => {
      extractCategories(sub, categories);
    });
  }

  return categories;
}

export default {
  descriptionHtmlLocalized,
  descriptionText,
  priceText,
  normalizeAndroidVersion,
  buildHistogram,
  extractComments,
  extractFeatures,
  extractCategories
};
