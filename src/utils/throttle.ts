const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

interface ThrottleOpts {
  interval: number;
  limit: number;
}

type Throttler = <T, U> (fn: (arg: T) => Promise<U>, opts: ThrottleOpts) => (arg: T) => Promise<U>;

function Throttle (): Throttler {
  let nextAllowedTime = Date.now();

  return function settingOptions <T, U> (fn: (arg: T) => Promise<U>, opts: ThrottleOpts) {
    const ms = opts.interval;
    const limit = opts.limit;
    const delayPerRequest = ms / limit;

    return async function returnedFunction (arg: T): Promise<U> {
      const now = Date.now();
      const delay = Math.max(0, nextAllowedTime - now);
      nextAllowedTime = Math.max(now, nextAllowedTime) + delayPerRequest;

      if (delay > 0) {
        await sleep(delay);
      }

      return fn(arg);
    };
  };
}

const throttledRequest = Throttle();
export default throttledRequest;
