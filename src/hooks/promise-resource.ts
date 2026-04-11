import { useCallback, useState, useTransition } from 'react';

export type PromiseResource<R, T> = [Promise<R>, (arg?: T) => void, boolean];
export const usePromiseResource = <R, T>(
    fetcher: (signal: AbortSignal, arg?: T) => Promise<R>,
    initialArg?: T,
): PromiseResource<R, T> => {
    const [isPending, startTransition] = useTransition();

    const createResource = useCallback(
        (arg?: T) => {
            const controller = new AbortController();
            const promise = fetcher(controller.signal, arg);

            return {
                promise,
                abort: () => controller.abort(),
            };
        },
        [fetcher],
    );

    const [resource, setResource] = useState(() => createResource(initialArg));

    const refetch = useCallback(
        (arg = initialArg) => {
            startTransition(() => {
                setResource((prev) => {
                    prev.abort();
                    return createResource(arg);
                });
            });
        },
        [initialArg, createResource],
    );

    // always aborts at first
    // useEffect(() => {
    //     return () => resource.abort();
    // }, [resource]);

    return [resource.promise, refetch, isPending];
};
