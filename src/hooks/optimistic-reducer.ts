import { useOptimistic, useTransition } from 'react';

export const useOptimisticReducer = <S, A>(state: S, reducer: (state: S, action: A) => S) => {
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
