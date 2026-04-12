import { useCallback, useEffect, useState } from 'react';

const suspenseResourceAbortTimersCache = new Map<string, ReturnType<typeof setTimeout>>();
const suspenseResourceCache = new Map<
    string,
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: Promise<any>;
        abort: () => void;
    }
>();

type SuspenseResourceOpts<R> = {
    cacheKey: string;
    fetcher: (signal: AbortSignal) => Promise<R>;
};

export type SuspenseResource<R> = {
    promise: Promise<R>;
    refetch: () => void;
};

export const useSuspenseResource = <R>(opts: SuspenseResourceOpts<R>): SuspenseResource<R> => {
    const { cacheKey, fetcher } = opts;
    const [, forceUpdate] = useState(0);

    const getResource = () => {
        let res = suspenseResourceCache.get(cacheKey);
        if (!res) {
            const controller = new AbortController();
            res = {
                promise: fetcher(controller.signal),
                abort: () => controller.abort(),
            };
            suspenseResourceCache.set(cacheKey, res);
        }
        return res;
    };

    const resource = getResource();

    const refetch = useCallback(() => {
        const oldRes = suspenseResourceCache.get(cacheKey);
        if (oldRes) oldRes.abort();

        suspenseResourceCache.delete(cacheKey);

        forceUpdate((x) => x + 1);
    }, [cacheKey]);

    useEffect(() => {
        const abortTimer = suspenseResourceAbortTimersCache.get(cacheKey);
        if (abortTimer) {
            clearTimeout(abortTimer);
            suspenseResourceAbortTimersCache.delete(cacheKey);
        }

        return () => {
            const timeoutId = setTimeout(() => {
                const res = suspenseResourceCache.get(cacheKey);
                if (res) {
                    res.abort();
                    suspenseResourceCache.delete(cacheKey);
                }
                suspenseResourceAbortTimersCache.delete(cacheKey);
            }, 10);

            suspenseResourceAbortTimersCache.set(cacheKey, timeoutId);
        };
    }, [cacheKey]);

    return { promise: resource.promise, refetch };
};
