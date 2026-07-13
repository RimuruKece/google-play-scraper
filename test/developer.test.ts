import gplay from '../src/index.js';
import { assert } from 'chai';
import { assertValidApp, assertValidUrl } from './common.js';
import validator from 'validator';

describe('Developer method', () => {
  it('should fetch a valid application list for the given developer with string id', () => {
    return gplay.developer({ devId: 'Jam City, Inc.' })
      .then((apps: any[]) => apps.map(assertValidApp))
      .then((apps: any[]) => apps.map((app: any) => assert.equal(app.developer, 'Jam City, Inc.')));
  });

  it('should fetch a valid application list for the given developer with numeric id', () => {
    return gplay.developer({ devId: '5700313618786177705' })
      .then((apps: any[]) => apps.map(assertValidApp))
      .then((apps: any[]) => apps.forEach((app: any) => {
        if (app.developerId) {
          assert.equal(app.developerId, '5700313618786177705');
        }
      }));
  });

  it('should not throw an error if too many apps requested', () => {
    return gplay.developer({ devId: '5700313618786177705', num: 500 })
      .then((apps: any[]) => {
        assert.isTrue(apps.length > 0, 'should return at least one app');
      });
  });

  it('should fetch a valid application list with full detail', () => {
    return gplay.developer({ devId: '5700313618786177705', num: 10, fullDetail: true })
      .then((apps: any[]) => {
        apps.forEach((app: any) => {
          assert.isNumber(app.minInstalls);
          if (app.released) {
            assert.isNumber(app.reviews);
          }

          assert.isString(app.description);
          assert.isString(app.descriptionHTML);
          assert.isNumber(app.updated);

          assert.exists(app.genre);
          assert.exists(app.genreId);

          assert.isString(app.version || '');
          assert.isString(app.size || '');
          assert.isString(app.androidVersionText);
          assert.isString(app.androidVersion);
          assert.isString(app.contentRating);

          assert.exists(app.priceText);
          assert.exists(app.free);

          assert.isString(app.developer);
          assert.isString(app.developerId);
          if (app.developerWebsite) {
            assertValidUrl(app.developerWebsite);
          }
          assert(validator.isEmail(app.developerEmail), `${app.developerEmail} is not an email`);

          ['1', '2', '3', '4', '5'].map((v: string) => assert.property(app.histogram, v));
          app.screenshots.map(assertValidUrl);
          app.comments.map(assert.isString);
        });
      });
  }).timeout(15 * 1000);
});
