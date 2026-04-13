import { useEffect, useState } from 'react';

type EffectResourceOpts<R> = {
    fetcher: (signal: AbortSignal) => Promise<R>;
};

export type EffectResource<R> =
    | { state: 'pending'; data: null; error: null }
    | { state: 'ready' | 'refreshing'; data: R; error: null }
    | { state: 'errored'; data: R | null; error: Error };
export type EffectResourceActions = {
    refetch: () => void;
};

export const useEffectResource = <R>(
    opts: EffectResourceOpts<R>,
): [EffectResource<R>, EffectResourceActions] => {
    const { fetcher } = opts;

    const [res, setRes] = useState<EffectResource<R>>({
        data: null,
        state: 'pending',
        error: null,
    });

    const [version, setVersion] = useState(0);
    const refetch = () => {
        setRes((prev) => {
            if (prev.data === null) return { data: null, state: 'pending', error: null };
            return { data: prev.data, state: 'refreshing', error: null };
        });
        setVersion((v) => v + 1);
    };

    useEffect(() => {
        const controller = new AbortController();

        fetcher(controller.signal)
            .then((data) => {
                setRes({
                    data,
                    state: 'ready',
                    error: null,
                });
            })
            .catch((err) => {
                if (controller.signal.aborted) return;

                console.error(err);

                setRes((prev) => ({
                    data: prev.data,
                    state: 'errored',
                    error: err instanceof Error ? err : new Error(String(err)),
                }));
            });

        return () => {
            controller.abort();
        };
    }, [fetcher, version]);

    return [res, { refetch }];
};
