import createDebug from 'debug';
import type { ScrapedData } from '../types.js';
import { path } from './path.js';
import { hasRequiredFields } from './validate.js';

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

  return path(formattedPath, parsedData) as ScrapedData;
}

function extractor (mappings: Record<string, unknown>) {
  return function extractFields (parsedData: ScrapedData): Record<string, unknown> {
    debug('parsedData: %o', parsedData);

    const result: Record<string, unknown> = {};
    for (const [key, rawValue] of Object.entries(mappings)) {
      if (Array.isArray(rawValue)) {
        result[key] = path(rawValue as (string | number)[], parsedData);
      } else {
        const spec = rawValue as Record<string, unknown>;
        let input: ScrapedData;
        if (spec.useServiceRequestId) {
          input = extractDataWithServiceRequestId(parsedData as unknown as ParsedData, spec as unknown as ServiceRequestSpec);
        } else {
          input = path(spec.path as (string | number)[] || [], parsedData) as ScrapedData;
          if ((input === null || input === undefined) && spec.fallbackPath) {
            input = path(spec.fallbackPath as (string | number)[], parsedData) as ScrapedData;
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
      try {
        const key = keyMatch[1];
        const value: ScrapedData = JSON.parse(valueMatch[1]) as ScrapedData;
        return { ...accum, [key]: value };
      } catch {
        debug('Failed to parse ds value for key %s', keyMatch[1]);
      }
    }
    return accum;
  }, {});

  return Object.assign(
    {},
    parsedData,
    { serviceRequestData: parseServiceRequests(response) }
  ) as ParsedData;
}
function parseBatchExecute (html: string): ScrapedData | null {
  try {
    const input: unknown[][] = JSON.parse(html.substring(5)) as unknown[][];
    return JSON.parse((input[0] as unknown[])[2] as string) as ScrapedData;
  } catch {
    debug('Failed to parse batchexecute response');
    return null;
  }
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

  // Google Play returns single-quoted JS object literals.
  // Convert to double-quoted and parse with JSON.parse (safe, no eval).
  try {
    const raw = valueMatch[0].trim();
    const doubleQuoted = raw.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
    return JSON.parse(doubleQuoted) as Record<string, ScrapedData>;
  } catch (err) {
    debug('Failed to parse service request data: %o', err);
    return {};
  }
}
function extractApps<T> (mappings: Record<string, unknown>, root: ScrapedData, rootPath: (string | number)[]): T[] {
  const raw = path(rootPath, root);
  if (!Array.isArray(raw)) return [];
  const extract = extractor(mappings);
  return (raw as ScrapedData[])
    .map(extract)
    .filter((item): item is Record<string, unknown> =>
      hasRequiredFields(item as Record<string, unknown>, ['title', 'appId'])
    ) as unknown as T[];
}

export default { parse, parseServiceRequests, parseBatchExecute, extractor, extractDataWithServiceRequestId, extractApps };
export type { ParsedData };
