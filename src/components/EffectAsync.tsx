import type { EffectResource } from '@hooks';
import { useEffect, useState, type ReactNode } from 'react';

type EffectAsnycProps<R> = {
    resource: EffectResource<R>;
    pending: ReactNode;
    ready: (data: R) => ReactNode;
    errored: (error: Error) => ReactNode;
};
export const EffectAsync = <R,>({ resource, pending, ready, errored }: EffectAsnycProps<R>) => {
    const { data, state, error } = resource;

    const [showRefreshing, setShowRefreshing] = useState(false);

    useEffect(() => {
        if (state !== 'refreshing') return;

        const timer = setTimeout(() => setShowRefreshing(true), 1000);
        return () => {
            setShowRefreshing(false);
            clearTimeout(timer);
        };
    }, [state]);

    if (state === 'pending') return pending;
    if (state === 'refreshing' && showRefreshing) return pending;
    if (state === 'errored' && error) return errored(error);
    return ready(data);
};
