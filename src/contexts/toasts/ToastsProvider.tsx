import { Toaster } from '@components';
import { ToastsContext, ToastsDispatchContext, toastsReducer } from '@contexts';
import { useCallback, useReducer, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

type ToastsProviderProps = {
    children: ReactNode;
};
export const ToastsProvider = ({ children }: ToastsProviderProps) => {
    const [toasts, dispatch] = useReducer(toastsReducer, []);

    const removeToast = useCallback((id: number) => {
        dispatch({
            type: 'delete',
            payload: id,
        });
    }, []);

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
