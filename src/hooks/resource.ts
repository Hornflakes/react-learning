import { useEffect, useState } from 'react';

type Resource<T> = {
    data: T | null;
    state: 'pending' | 'ready' | 'errored';
    error: Error | null;
};

export const useResource = <T>(fetcher: (signal: AbortSignal) => Promise<T>): Resource<T> => {
    const [data, setData] = useState<Resource<T>['data']>(null);
    const [state, setState] = useState<Resource<T>['state']>('pending');
    const [error, setError] = useState<Resource<T>['error']>(null);

    useEffect(() => {
        const controller = new AbortController();

        fetcher(controller.signal)
            .then((result) => {
                setData(result);
                setState('ready');
                setError(null);
            })
            .catch((err) => {
                if (controller.signal.aborted) return;

                setData(null);
                setState('errored');
                setError(err);
            });

        return () => {
            controller.abort();
        };
    }, [fetcher]);

    return { data, state, error };
};
