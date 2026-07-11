import url from 'url';
import scriptData from './scriptData.js';
import { BASE_URL } from '../constants.js';
import type { AppListItem, ScrapedData } from '../../types.js';

const MAPPINGS = {
  title: [2],
  appId: [12, 0],
  url: {
    path: [9, 4, 2],
    fun: (path: string) => new url.URL(path, BASE_URL).toString()
  },
  icon: [1, 1, 0, 3, 2],
  developer: [4, 0, 0, 0],
  developerId: {
    path: [4, 0, 0, 1, 4, 2],
    fun: extractDeveloperId
  },
  priceText: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price: string | undefined) => price === undefined ? 'FREE' : price
  },
  currency: [7, 0, 3, 2, 1, 0, 1],
  price: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price: string | undefined) => price === undefined ? 0 : parseFloat(price?.match(/([0-9.,]+)/)?.[0] ?? '0')
  },
  free: {
    path: [7, 0, 3, 2, 1, 0, 2],
    fun: (price: string | undefined) => price === undefined
  },
  summary: [4, 1, 1, 1, 1],
  scoreText: [6, 0, 2, 1, 0],
  score: [6, 0, 2, 1, 1]
};

function extractDeveloperId (link: string): string {
  return link.split('?id=')[1];
}

function extract (root: (string | number)[], data: ScrapedData): AppListItem[] {
  return scriptData.extractApps<AppListItem>(MAPPINGS, data, root);
}

export default { MAPPINGS, extract };
