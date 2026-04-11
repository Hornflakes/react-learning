import type { EffectResource } from '@hooks';

type EffectAsnycProps<R> = {
    resource: EffectResource<R>;
    pending: React.ReactNode;
    ready: (data: R) => React.ReactNode;
    errored: (error: Error) => React.ReactNode;
};
export const EffectAsync = <R,>({ resource, pending, ready, errored }: EffectAsnycProps<R>) => {
    const { data, state, error } = resource;

    return <>{state === 'pending' ? pending : error ? errored(error) : ready(data)}</>;
};
