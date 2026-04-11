import { useEffect, useState } from 'react';

type EffectResourceOpts<R> = {
    fetcher: (signal: AbortSignal) => Promise<R>;
};

export type EffectResource<R> = {
    data: R | null;
    state: 'pending' | 'ready' | 'refreshing' | 'errored';
    error: Error | null;
};
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
        setRes((prev) => ({
            ...prev,
            state: 'refreshing',
        }));
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

                setRes({
                    data: null,
                    state: 'errored',
                    error: err instanceof Error ? err : new Error(String(err)),
                });
            });

        return () => {
            controller.abort();
        };
    }, [fetcher, version]);

    return [res, { refetch }] as const;
};
