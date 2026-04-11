import { ErrorBoundary } from '@components';
import { Suspense, use, type ReactNode } from 'react';

type AsyncProps<R> = {
    promise: Promise<R>;
    ready: (data: R) => ReactNode;
};
const Async = <R,>({ promise, ready }: AsyncProps<R>) => {
    console.log('[Async] rendered');

    const data = use(promise);
    return <>{ready(data)}</>;
};

export type SuspenseAsyncProps<R> = {
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
    console.log('[SuspenseAsync] rendered');

    return (
        <ErrorBoundary fallback={(error, reset) => errored({ error, refetch, reset })}>
            <Suspense fallback={pending}>
                <Async promise={promise} ready={ready} />
            </Suspense>
        </ErrorBoundary>
    );
};
