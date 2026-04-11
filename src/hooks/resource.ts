import { useEffect, useState } from 'react';

type Resource<T> = {
    data: T | null;
    state: 'pending' | 'ready' | 'refreshing' | 'errored';
    error: Error | null;
};
type ResourceActions = {
    refetch: () => void;
};

export const useResource = <T>(
    fetcher: (signal: AbortSignal) => Promise<T>,
): [Resource<T>, ResourceActions] => {
    const [res, setRes] = useState<Resource<T>>({
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
