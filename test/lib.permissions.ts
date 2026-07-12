import gplay from '../index.js';
import { assert } from 'chai';

describe('Permissions method', () => {
  it('should return an array of permissions and descriptions', () =>
    gplay.permissions({ appId: 'com.sgn.pandapop.gp' })
      .then((results: any) => {
        assert(results.length);
        results.forEach((perm: any) => {
          assert.isString(perm.permission);
          assert.isString(perm.type);
        });
      }));

  it('should return an array of permissions and descriptions for different response format', () =>
    gplay.permissions({ appId: 'air.tv.ingames.cubematch.free' })
      .then((results: any) => {
        assert.isArray(results);
        results.forEach((perm: any) => {
          assert.isString(perm.permission);
          assert.isString(perm.type);
        });
      }));

  it('should return skip descriptions if short option is passed', () =>
    gplay.permissions({ appId: 'com.sgn.pandapop.gp', short: true })
      .then((results: any) => {
        assert(results.length);
        results.map(assert.isString);
      }));

  it('should return skip descriptions if short option is passed for different response format', () =>
    gplay.permissions({ appId: 'air.tv.ingames.cubematch.free', short: true })
      .then((results: any) => {
        assert.isArray(results);
        results.map(assert.isString);
      }));

  it('should return even if app have no common permissions', () =>
    gplay.permissions({ appId: 'com.skybornegames.battlepop' })
      .then((results: any) => {
        assert.isArray(results);
        results.forEach((perm: any) => {
          assert.isString(perm.permission);
          assert.isString(perm.type);
        });
      }));

  it('should return empty if app have no common permissions and short option is passed', () =>
    gplay.permissions({ appId: 'com.skybornegames.battlepop', short: true })
      .then((results: any) => {
        assert.equal(0, results.length);
      }));
});
