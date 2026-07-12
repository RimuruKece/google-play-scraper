const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface ThrottleOpts {
  interval: number;
  limit: number;
}

type Throttler = <T, U> (fn: (arg: T) => Promise<U>, opts: ThrottleOpts) => (arg: T) => Promise<U>;

function Throttle (): Throttler {
  let startedAt: number | null = null;
  let timesCalled = 0;
  let inThrottle = false;

  return function settingOptions <T, U> (fn: (arg: T) => Promise<U>, opts: ThrottleOpts) {
    const ms = opts.interval;
    const number = opts.limit;

    return async function returnedFunction (arg: T): Promise<U> {
      if (!startedAt) startedAt = Date.now();

      if (timesCalled < number && Date.now() - startedAt < ms) {
        timesCalled++;
        return fn(arg);
      }

      if (!inThrottle) {
        inThrottle = true;
        await sleep(ms);
        timesCalled = 0;
        startedAt = Date.now();
        const result = await returnedFunction(arg);
        inThrottle = false;
        return result;
      }

      const remaining = ms - (Date.now() - startedAt!);
      await sleep(Math.max(remaining, 10));
      return returnedFunction(arg);
    };
  };
}

const throttledRequest = Throttle();
export default throttledRequest;
