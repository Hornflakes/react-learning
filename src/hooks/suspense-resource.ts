import { useCallback, useEffect, useState, useTransition } from 'react';

const suspenseResourceAbortTimersCache = new Map<string, ReturnType<typeof setTimeout>>();
const suspenseResourceCache = new Map<
    string,
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: Promise<any>;
        abort: () => void;
    }
>();

export type SuspenseResourceOpts<R, T> = {
    cacheKey: string;
    fetcher: (signal: AbortSignal, arg?: T) => Promise<R>;
    initialArg?: T;
};
export type SuspenseResource<R, T> = [Promise<R>, (arg?: T) => void, boolean];
export const useSuspenseResource = <R, T>(
    opts: SuspenseResourceOpts<R, T>,
): SuspenseResource<R, T> => {
    const { cacheKey, fetcher, initialArg } = opts;

    const [isPending, startTransition] = useTransition();
    const [, forceUpdate] = useState(0);

    const getResource = (arg?: T) => {
        let res = suspenseResourceCache.get(cacheKey);
        if (!res) {
            const controller = new AbortController();
            res = {
                promise: fetcher(controller.signal, arg),
                abort: () => controller.abort(),
            };
            suspenseResourceCache.set(cacheKey, res);
        }
        return res;
    };

    const resource = getResource(initialArg);

    const refetch = useCallback(() => {
        const oldRes = suspenseResourceCache.get(cacheKey);
        if (oldRes) oldRes.abort();

        suspenseResourceCache.delete(cacheKey);

        startTransition(() => {
            forceUpdate((x) => x + 1);
        });
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

    return [resource.promise, refetch, isPending];
};
