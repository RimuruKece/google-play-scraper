import createDebug from 'debug';
import * as R from 'ramda';
import type { ScrapedData } from '../../types.js';

const debug = createDebug('google-play-scraper:scriptData');

interface ParsedData {
  serviceRequestData: Record<string, ScrapedData>;
  [key: string]: ScrapedData;
}

interface ServiceRequestSpec {
  path?: (string | number)[];
  useServiceRequestId?: string;
}

function extractDataWithServiceRequestId (parsedData: ParsedData, spec: ServiceRequestSpec): ScrapedData {
  const serviceRequestMapping = Object.keys(parsedData.serviceRequestData);
  const filteredDsRootPath = serviceRequestMapping.filter(serviceRequest => {
    const dsValues = parsedData.serviceRequestData[serviceRequest] as Record<string, ScrapedData>;
    return dsValues.id === spec.useServiceRequestId;
  });

  const formattedPath = (filteredDsRootPath.length)
    ? [filteredDsRootPath[0], ...(spec.path || [])]
    : (spec.path || []);

  return R.path(formattedPath, parsedData) as ScrapedData;
}

function extractor (mappings: Record<string, unknown>) {
  return function extractFields (parsedData: ScrapedData): Record<string, unknown> {
    debug('parsedData: %o', parsedData);

    const result: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(mappings)) {
      if (Array.isArray(rawValue)) {
        result[key] = R.path(rawValue as (string | number)[], parsedData);
      } else {
        const spec = rawValue as Record<string, unknown>;
        let input: ScrapedData;
        if (spec.useServiceRequestId) {
          input = extractDataWithServiceRequestId(parsedData as unknown as ParsedData, spec as unknown as ServiceRequestSpec);
        } else {
          input = R.path(spec.path as (string | number)[] | undefined || [], parsedData) as ScrapedData;
          if ((input === null || input === undefined) && spec.fallbackPath) {
            input = R.path(spec.fallbackPath as (string | number)[], parsedData) as ScrapedData;
          }
        }

        const fn = spec.fun as ((val: ScrapedData, data?: ScrapedData) => unknown) | undefined;
        result[key] = fn ? fn(input, parsedData) : input;
      }
    }
    return result;
  };
}

function parse (response: string): ParsedData {
  const scriptRegex = />AF_initDataCallback[\s\S]*?<\/script/g;
  const keyRegex = /(ds:.*?)'/;
  const valueRegex = /data:([\s\S]*?), sideChannel: {}}\);<\//;

  const matches = response.match(scriptRegex);

  if (!matches) {
    return { serviceRequestData: {} } as ParsedData;
  }

  const parsedData = matches.reduce((accum: Record<string, unknown>, data: string) => {
    const keyMatch = data.match(keyRegex);
    const valueMatch = data.match(valueRegex);

    if (keyMatch && valueMatch) {
      const key = keyMatch[1];
      const value = JSON.parse(valueMatch[1]);
      return R.assoc(key, value, accum);
    }
    return accum;
  }, {});

  return Object.assign(
    {},
    parsedData,
    { serviceRequestData: parseServiceRequests(response) }
  ) as ParsedData;
}
function parseBatchExecute (html: string): ScrapedData {
  const input = JSON.parse(html.substring(5));
  return JSON.parse(input[0][2]);
}

function parseServiceRequests (response: string): Record<string, ScrapedData> {
  const scriptRegex = /; var AF_dataServiceRequests[\s\S]*?; var AF_initDataChunkQueue/g;
  const valueRegex = /{'ds:[\s\S]*}}/g;

  const matches = response.match(scriptRegex);

  if (!matches) {
    return {};
  }

  const [data] = matches;
  const valueMatch = data.match(valueRegex);

  if (!valueMatch) {
    return {};
  }

  // Google Play returns single-quoted JS objects that JSON.parse can't handle.
  // Validate string is a safe object literal — strip string contents then check for risky tokens.
  const raw = valueMatch[0].trim();
  const structural = raw.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
  if (!/^[[{]/.test(structural) || /=|\(|!|~|`|\bnew\b|\bfunction\b|\bclass\b|\bimport\b/.test(structural)) {
    debug('Unsafe pattern detected in service request data, skipping eval');
    return {};
  }
  // eslint-disable-next-line no-new-func
  const fn = new Function('return ' + raw);
  return fn() as Record<string, ScrapedData>;
}
function extractApps<T> (mappings: Record<string, unknown>, root: ScrapedData, path: (string | number)[]): T[] {
  const raw = R.path(path, root);
  if (!Array.isArray(raw)) return [];
  const extract = extractor(mappings);
  return (raw as ScrapedData[]).map(extract) as unknown as T[];
}

export default { parse, parseServiceRequests, parseBatchExecute, extractor, extractDataWithServiceRequestId, extractApps };
export type { ParsedData };
