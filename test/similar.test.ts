import { assert } from 'chai';
import gplay from '../src/index.js';
import { assertValidApp } from './common.js';

describe('Similar method', () => {
  it('should fetch a valid application list', function () {
    this.timeout(15000);
    return gplay.similar({ appId: 'com.mojang.minecraftpe' })
      .then((apps: any[]) => apps.map(assertValidApp));
  });

  it('should fetch apps from similar category', function () {
    this.timeout(15000);
    return gplay.similar({ appId: 'com.spotify.music' })
      .then((apps: any[]) => {
        assert.isAbove(apps.length, 0);
        apps.map(assertValidApp);
      });
  });
});
