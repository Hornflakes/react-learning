import { useCallback, useEffect, useState } from 'react';

const resourceCache = new Map<
    string,
    {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        promise: Promise<any>;
        abort: () => void;
        users: number;
    }
>();
const abortTimersCache = new Map<string, ReturnType<typeof setTimeout>>();
const resourceVersions: Record<string, number> = {};

type SuspenseResourceOpts<R> = {
    cacheKey: string;
    fetcher: (signal: AbortSignal) => Promise<R>;
};
export type SuspenseResource<R> = {
    promise: Promise<R>;
    refetch: () => void;
    version: number;
};
export const useSuspenseResource = <R>(opts: SuspenseResourceOpts<R>): SuspenseResource<R> => {
    const { cacheKey, fetcher } = opts;
    const [, forceUpdate] = useState(0);

    const getResource = () => {
        let res = resourceCache.get(cacheKey);
        if (!res) {
            const controller = new AbortController();
            res = {
                promise: fetcher(controller.signal),
                abort: () => controller.abort(),
                users: 0,
            };
            resourceCache.set(cacheKey, res);
        }
        return res;
    };
    const resource = getResource();

    const refetch = useCallback(() => {
        const oldRes = resourceCache.get(cacheKey);
        oldRes?.abort();

        resourceCache.delete(cacheKey);
        resourceVersions[cacheKey]++;

        window.dispatchEvent(new Event(`suspense-resource_poke-${cacheKey}`));
    }, [cacheKey]);

    useEffect(() => {
        resourceVersions[cacheKey] ??= 0;

        const onPoke = () => forceUpdate((x) => x + 1);
        window.addEventListener(`suspense-resource_poke-${cacheKey}`, onPoke);
        return () => window.removeEventListener(`suspense-resource_poke-${cacheKey}`, onPoke);
    }, [cacheKey]);

    useEffect(() => {
        const res = resourceCache.get(cacheKey);
        if (!res) return;
        res.users++;

        const timer = abortTimersCache.get(cacheKey);
        if (timer) {
            clearTimeout(timer);
            abortTimersCache.delete(cacheKey);
        }

        return () => {
            const res = resourceCache.get(cacheKey);
            if (!res) return;

            res.users--;
            if (res.users) return;

            const timer = setTimeout(() => {
                res.abort();
                resourceCache.delete(cacheKey);
                abortTimersCache.delete(cacheKey);
            }, 10);

            abortTimersCache.set(cacheKey, timer);
        };
    }, [cacheKey]);

    return { promise: resource.promise, refetch, version: resourceVersions[cacheKey] };
};
