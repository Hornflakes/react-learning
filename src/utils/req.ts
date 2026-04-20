export const delay = (ms: number): Promise<void> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, ms);
    });
};

export const abortableDelay = (ms: number, signal: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (signal.aborted) {
            reject(new DOMException('Aborted', 'AbortError'));
            return;
        }

        const onAbort = () => {
            clearTimeout(timer);
            reject(new DOMException('Aborted', 'AbortError'));
        };
        const timer = setTimeout(() => {
            signal.removeEventListener('abort', onAbort);
            resolve();
        }, ms);

        signal.addEventListener('abort', onAbort, { once: true });
    });
};

type RandomDelayOpts = {
    min: number;
    max: number;
};
const randomAbortableDelay = (
    { min, max }: RandomDelayOpts,
    signal: AbortSignal,
): Promise<void> => {
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const randomMs = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
    return abortableDelay(randomMs, signal);
};

export const shouldFail = (failRate: number): boolean => {
    const safeFailRate = Math.min(Math.max(failRate, 0), 1);
    return Math.random() < safeFailRate;
};

type MockReqOpts<T> = {
    data: T;
    minResponseTime?: number;
    maxResponseTime?: number;
    failRate?: number;
};
const mockReq = async <T>(
    { data, minResponseTime = 2000, maxResponseTime = 3000, failRate = 0 }: MockReqOpts<T>,
    signal: AbortSignal,
): Promise<T> => {
    await randomAbortableDelay({ min: minResponseTime, max: maxResponseTime }, signal);

    if (shouldFail(failRate)) throw new Error('Mock request failed');

    return structuredClone(data);
};

export const createMockReq =
    <T>(opts: MockReqOpts<T>) =>
    (signal: AbortSignal): Promise<T> =>
        mockReq(opts, signal);
