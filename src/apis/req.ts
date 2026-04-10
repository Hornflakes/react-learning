const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

type RandomDelayOpts = {
    min: number;
    max: number;
};
const randomDelay = ({ min, max }: RandomDelayOpts): Promise<void> => {
    const safeMin = Math.min(min, max);
    const safeMax = Math.max(min, max);
    const randomMs = Math.floor(Math.random() * (safeMax - safeMin + 1)) + safeMin;
    return delay(randomMs);
};

const shouldFail = (failRate: number): boolean => {
    const safeFailRate = Math.min(Math.max(failRate, 0), 1);
    return Math.random() < safeFailRate;
};

type MockReqOpts<T> = {
    data: T;
    minResponseTime?: number;
    maxResponseTime?: number;
    failRate?: number;
};
export const mockReq = async <T>({
    data,
    minResponseTime = 500,
    maxResponseTime = 1000,
    failRate = 0.1,
}: MockReqOpts<T>): Promise<T> => {
    await randomDelay({ min: minResponseTime, max: maxResponseTime });

    if (shouldFail(failRate)) {
        throw new Error('Mock request failed');
    }

    return structuredClone(data);
};
