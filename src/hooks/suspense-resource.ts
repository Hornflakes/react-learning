/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useSyncExternalStore } from 'react';

type ResourcePromise<R> = {
    promise: Promise<R>;
    abort: () => void;
    users: number;
    version: number;
};

const resourceCache = new Map<string, ResourcePromise<any>>();
const abortTimersCache = new Map<string, ReturnType<typeof setTimeout>>();
const resourceVersions: Record<string, number> = {};
const subscribers = new Map<string, Set<() => void>>();

const emit = (cacheKey: string) => {
    const ss = subscribers.get(cacheKey);
    if (!ss) return;

    for (const s of ss) {
        s();
    }
};

const store = {
    subscribe(cacheKey: string, s: () => void) {
        if (!subscribers.has(cacheKey)) {
            subscribers.set(cacheKey, new Set());
        }
        const ss = subscribers.get(cacheKey)!;
        ss.add(s);

        return () => {
            ss.delete(s);
            if (ss.size === 0) {
                subscribers.delete(cacheKey);
            }
        };
    },

    getSnapshot(cacheKey: string) {
        return resourceCache.get(cacheKey);
    },

    getOrCreate(cacheKey: string, fetcher: (signal: AbortSignal) => Promise<any>) {
        let res = resourceCache.get(cacheKey);
        if (!res) {
            const controller = new AbortController();
            res = {
                promise: fetcher(controller.signal),
                abort: () => controller.abort(),
                users: 0,
                version: (resourceVersions[cacheKey] ??= 0),
            };
            resourceCache.set(cacheKey, res);
        }
        return res;
    },

    claim(cacheKey: string) {
        const res = resourceCache.get(cacheKey);
        if (!res) return;

        res.users++;
        const timer = abortTimersCache.get(cacheKey);
        if (timer) {
            clearTimeout(timer);
            abortTimersCache.delete(cacheKey);
        }
    },

    release(cacheKey: string) {
        const res = resourceCache.get(cacheKey);
        if (!res) return;

        res.users--;

        if (res.users <= 0) {
            const timer = setTimeout(() => {
                res.abort();
                resourceCache.delete(cacheKey);
                abortTimersCache.delete(cacheKey);
                emit(cacheKey);
            }, 100);

            abortTimersCache.set(cacheKey, timer);
        }
    },

    invalidate(cacheKey: string) {
        const res = resourceCache.get(cacheKey);
        res?.abort();

        resourceCache.delete(cacheKey);
        resourceVersions[cacheKey]++;
        emit(cacheKey);
    },
};

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

    const storeSubscribe = useCallback(
        (onStoreChange: () => void) => store.subscribe(cacheKey, onStoreChange),
        [cacheKey],
    );
    const resource =
        useSyncExternalStore(storeSubscribe, () => store.getSnapshot(cacheKey)) ??
        store.getOrCreate(cacheKey, fetcher);

    const refetch = useCallback(() => {
        store.invalidate(cacheKey);
    }, [cacheKey]);

    useEffect(() => {
        store.claim(cacheKey);
        return () => store.release(cacheKey);
    }, [cacheKey]);

    return { promise: resource.promise, refetch, version: resource.version };
};
