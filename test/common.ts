import { assert } from 'chai';
import validator from 'validator';

function assertValidUrl (url: string): void {
  return assert(validator.isURL(url, { allow_protocol_relative_urls: true }),
    `${url} is not a valid url`);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertValidApp (app: any): any {
  assert.isString(app.appId);
  assert.isString(app.title);
  assert.isString(app.summary);
  assertValidUrl(app.url);
  assertValidUrl(app.icon);

  if (app.score !== undefined) {
    assert.isNumber(app.score);
    assert(app.score >= 0);
    assert(app.score <= 5);
  }

  assert.isBoolean(app.free);

  if (app.priceText !== undefined) {
    assert.isString(app.priceText);
  }

  return app;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function assertIdsInArray (apps: any[], ...ids: string[]): void {
  assert.isTrue(ids.every((id) => apps.some((app) => app.appId === id)));
}

export { assertValidUrl, assertValidApp, assertIdsInArray };
