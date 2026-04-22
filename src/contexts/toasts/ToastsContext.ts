import type { Action } from '@utils';
import { createContext, type Dispatch, useContext } from 'react';

export type Toast = {
    id: number;
    type: 'success' | 'error';
    message: string;
};

export type ToastsAction = Action<'create', Omit<Toast, 'id'>> | Action<'delete', number>;
export const toastsReducer = (draft: Toast[], action: ToastsAction) => {
    switch (action.type) {
        case 'create': {
            draft.push({
                id: Temporal.Now.instant().epochMilliseconds,
                ...action.payload,
            });
            return draft;
        }
        case 'delete': {
            return draft.filter((t) => t.id !== action.payload);
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
