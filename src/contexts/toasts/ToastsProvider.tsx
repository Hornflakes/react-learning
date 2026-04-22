import { Toaster } from '@components';
import {
    ToastsContext,
    ToastsDispatchContext,
    toastsReducer,
    type Toast,
    type ToastsAction,
} from '@contexts';
import { useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useImmerReducer } from 'use-immer';

type ToastsProviderProps = {
    children: ReactNode;
};
export const ToastsProvider = ({ children }: ToastsProviderProps) => {
    const [toasts, dispatch] = useImmerReducer<Toast[], ToastsAction>(toastsReducer, []);

    const removeToast = useCallback(
        (id: number) => {
            dispatch({
                type: 'delete',
                payload: id,
            });
        },
        [dispatch],
    );

    return (
        <ToastsContext value={toasts}>
            <ToastsDispatchContext value={dispatch}>
                {children}

                {createPortal(
                    <div className="toasts">
                        {toasts.map((t) => (
                            <div
                                key={t.id}
                                className="toast-anchor"
                                style={{
                                    anchorName: `--anchor-${t.id}`,
                                }}
                            >
                                <Toaster
                                    id={t.id}
                                    type={t.type}
                                    message={t.message}
                                    onClose={removeToast}
                                    anchorName={`--anchor-${t.id}`}
                                />
                            </div>
                        ))}
                    </div>,
                    document.body,
                )}
            </ToastsDispatchContext>
        </ToastsContext>
    );
};
