import { delay, shouldFail } from '@utils';
import { useCallback, useRef, type Dispatch } from 'react';

type AsyncDispatchOpts<A> = {
    dispatch: Dispatch<A>;
    failRate?: number;
};
export const useAsyncDispatch = <A>({ dispatch, failRate = 0 }: AsyncDispatchOpts<A>) => {
    const controllerRef = useRef<AbortController>(null);

    const asyncDispatch = useCallback(
        async (action: A, delayMs = 1000) => {
            controllerRef.current?.abort();
            const controller = new AbortController();
            controllerRef.current = controller;

            await delay(delayMs, controller.signal);
            if (shouldFail(failRate)) throw new Error('Mock dispatch failed');
            dispatch(action);
        },
        [dispatch, failRate],
    );

    const cancelAsyncDispatch = useCallback(() => {
        controllerRef.current?.abort();
    }, []);

    return {
        asyncDispatch,
        cancelAsyncDispatch,
    };
};
