import { delay } from '@utils';
import { useCallback, useRef, type Dispatch } from 'react';

export const useAsyncDispatch = <A>(dispatch: Dispatch<A>) => {
    const controllerRef = useRef<AbortController>(null);

    const asyncDispatch = useCallback(
        async (action: A, delayMs = 1000) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;

            await delay(delayMs, controller.signal);
            dispatch(action);
        },
        [dispatch],
    );

    const cancelAsyncDispatch = useCallback(() => {
        controllerRef.current?.abort();
    }, []);

    return {
        asyncDispatch,
        cancelAsyncDispatch,
    };
};
