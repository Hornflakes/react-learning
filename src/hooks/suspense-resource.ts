import { useCallback, useEffect, useState } from 'react';

const suspenseResourceAbortTimersCache = new Map<string, ReturnType<typeof setTimeout>>();
const suspenseResourceCache = new Map<
    string,
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: Promise<any>;
        abort: () => void;
        users: number;
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
                users: 0,
            };
            suspenseResourceCache.set(cacheKey, res);
        }
        return res;
    };

    const resource = getResource();

    useEffect(() => {
        const res = suspenseResourceCache.get(cacheKey);
        if (!res) return;
        res.users++;

        const existingTimer = suspenseResourceAbortTimersCache.get(cacheKey);
        if (existingTimer) {
            clearTimeout(existingTimer);
            suspenseResourceAbortTimersCache.delete(cacheKey);
        }

        return () => {
            const res = suspenseResourceCache.get(cacheKey);
            if (!res) return;

            res.users--;
            if (res.users) return;

            const timer = setTimeout(() => {
                res.abort();
                suspenseResourceCache.delete(cacheKey);
                suspenseResourceAbortTimersCache.delete(cacheKey);
            }, 10);

            suspenseResourceAbortTimersCache.set(cacheKey, timer);
        };
    }, [cacheKey]);

    const refetch = useCallback(() => {
        const oldRes = suspenseResourceCache.get(cacheKey);
        if (oldRes) oldRes.abort();

        suspenseResourceCache.delete(cacheKey);

        forceUpdate((x) => x + 1);
    }, [cacheKey]);

    return { promise: resource.promise, refetch };
};
