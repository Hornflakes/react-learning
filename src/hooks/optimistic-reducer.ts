import { useOptimistic, useTransition } from 'react';

export const useOptimisticReducer = <T, A>(state: T, reducer: (state: T, action: A) => T) => {
    const [isPending, startTransition] = useTransition();
    const [optimisticState, setOptimisticState] = useOptimistic(state, reducer);

    const dispatchOptimistic = (action: A, asyncFn: () => Promise<void>) => {
        startTransition(async () => {
            setOptimisticState(action);
            await asyncFn();
        });
    };

    return {
        optimisticState,
        dispatchOptimistic,
        isPending,
    };
};
