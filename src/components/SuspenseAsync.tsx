import { ErrorBoundary } from '@components';
import { Suspense, use, useDeferredValue, useEffect, useState, type ReactNode } from 'react';

type AsyncProps<R> = {
    promise: Promise<R>;
    ready: (data: R) => ReactNode;
};
const Async = <R,>({ promise, ready }: AsyncProps<R>) => {
    const data = use(promise);

    return <>{ready(data)}</>;
};

type SuspenseAsyncProps<R> = {
    promise: Promise<R>;
    refetch: () => void;
    pending: ReactNode;
    ready: (data: R) => ReactNode;
    errored: ({
        error,
        refetch,
        reset,
    }: {
        error: Error;
        refetch: () => void;
        reset: () => void;
    }) => ReactNode;
};
export const SuspenseAsync = <R,>({
    promise,
    refetch,
    pending,
    ready,
    errored,
}: SuspenseAsyncProps<R>) => {
    const deferredPromise = useDeferredValue(promise);
    const fetching = promise !== deferredPromise;
    const [showPending, setShowPending] = useState(false);

    useEffect(() => {
        if (!fetching) return;

        const timer = setTimeout(() => setShowPending(true), 1000);
        return () => {
            setShowPending(false);
            clearTimeout(timer);
        };
    }, [fetching]);

    return (
        <ErrorBoundary fallback={(error, reset) => errored({ error, refetch, reset })}>
            <Suspense fallback={pending}>
                {showPending ? pending : <Async promise={deferredPromise} ready={ready} />}
            </Suspense>
        </ErrorBoundary>
    );
};
