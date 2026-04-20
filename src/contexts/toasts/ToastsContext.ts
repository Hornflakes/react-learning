import type { Action } from '@utils';
import { createContext, type Dispatch, useContext } from 'react';

export type Toast = {
    id: number;
    type: 'success' | 'error';
    message: string;
};

type ToastsAction = Action<'create', Omit<Toast, 'id'>> | Action<'delete', number>;
export const toastsReducer = (toasts: Toast[], action: ToastsAction) => {
    switch (action.type) {
        case 'create': {
            return [
                ...toasts,
                {
                    id: Date.now(),
                    ...action.payload,
                },
            ];
        }
        case 'delete': {
            return toasts.filter((t) => t.id !== action.payload);
        }
    }
};

export const ToastsContext = createContext<Toast[] | undefined>(undefined);
export const ToastsDispatchContext = createContext<Dispatch<ToastsAction> | undefined>(undefined);

export const useToasts = () => {
    const ctx = useContext(ToastsContext);
    if (!ctx) throw new Error('useToasts must be used within a ToastsProvider');
    return ctx;
};

export const useToastsDispatch = () => {
    const ctx = useContext(ToastsDispatchContext);
    if (!ctx) throw new Error('useToastsDispatch must be used within a ToastsProvider');
    return ctx;
};
