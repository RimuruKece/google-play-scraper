import throttled from '../src/utils/throttle.js';
import { assert } from 'chai';

describe('Throttle tests', function () {
  this.timeout(15000);

  it('Should make three requests with 2000ms interval. (Throttle function)', function () {
    const callTimes: number[] = [];
    const fakeFn = async (_arg: unknown): Promise<{ headers: Record<string, string> }> => {
      callTimes.push(Date.now());
      return { headers: { date: new Date().toUTCString() } };
    };

    const req = throttled(fakeFn as any, {
      limit: 1,
      interval: 2000
    });

    const url = 'https://example.com/api';
    return Promise.all([req({ url }), req({ url }), req({ url })])
      .then(() => {
        assert.lengthOf(callTimes, 3);
        const diff1 = callTimes[1] - callTimes[0];
        const diff2 = callTimes[2] - callTimes[1];
        assert.isAtLeast(diff1, 1000);
        assert.isAtMost(diff1, 3000);
        assert.isAtLeast(diff2, 1000);
        assert.isAtMost(diff2, 3000);
      });
  });
});
