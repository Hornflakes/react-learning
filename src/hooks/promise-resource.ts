import { useEffect, useState } from 'react';

type Request<T> = {
    promise: Promise<T>;
    controller: AbortController;
    version: number;
};
export type PromiseResource<T> = {
    data: T | null;
    state: 'pending' | 'ready' | 'refreshing' | 'errored';
    error: Error | null;
    request: Request<T>;
};
export type PromiseResourceActions = {
    refetch: () => void;
};

export const usePromiseResource = <T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
): [PromiseResource<T>, PromiseResourceActions] => {
    const [state, setState] = useState<PromiseResource<T>>(() => {
        const controller = new AbortController();
        const promise = fetcher(controller.signal);

        return {
            data: null,
            state: 'pending',
            error: null,
            request: {
                promise,
                controller,
                version: 0,
            },
        };
    });

    useEffect(() => {
        const { promise, controller, version } = state.request;

        promise
            .then((data) => {
                setState((prev) => {
                    if (prev.request.version !== version) return prev;

                    return {
                        ...prev,
                        data,
                        state: 'ready',
                        error: null,
                    };
                });
            })
            .catch((err) => {
                if (controller.signal.aborted) return;

                setState((prev) => {
                    if (prev.request.version !== version) return prev;

                    return {
                        ...prev,
                        data: null,
                        state: 'errored',
                        error: err instanceof Error ? err : new Error(String(err)),
                    };
                });
            });

        return () => {
            controller.abort();
        };
    }, [state.request]);

    const refetch = () => {
        setState((prev) => {
            prev.request.controller.abort();

            const controller = new AbortController();
            const promise = fetcher(controller.signal);

            return {
                ...prev,
                state: 'refreshing',
                error: null,
                request: {
                    promise,
                    controller,
                    version: prev.request.version + 1,
                },
            };
        });
    };

    return [
        state,
        {
            refetch,
        },
    ];
};
