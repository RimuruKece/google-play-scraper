import url from 'url';
import { BASE_URL } from '../constants.js';

type MappingValue = (string | number)[] | { path: (string | number)[]; fun: (val: never, ...args: never[]) => unknown };
function listItemMappings (flat = false): Record<string, MappingValue> {
  const p = (path: (string | number)[]) => flat ? path.slice(1) : path;
  const appIdPath: (string | number)[] = flat ? [0, 0] : [0, 0, 0];

  return {
    title: p([0, 3]),
    appId: appIdPath,
    url: {
      path: p([0, 10, 4, 2]),
      fun: (path: string) => new url.URL(path, BASE_URL).toString()
    },
    icon: p([0, 1, 3, 2]),
    developer: p([0, 14]),
    currency: p([0, 8, 1, 0, 1]),
    price: {
      path: p([0, 8, 1, 0, 0]),
      fun: (price: number) => price / 1000000
    },
    free: {
      path: p([0, 8, 1, 0, 0]),
      fun: (price: number) => price === 0
    },
    summary: p([0, 13, 1]),
    scoreText: p([0, 4, 0]),
    score: p([0, 4, 1])
  };
}

export { listItemMappings };
