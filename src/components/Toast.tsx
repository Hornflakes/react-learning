import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

export type ToastProps = {
    type: 'success' | 'error';
    message: string;
    onClose: () => void;
};
export const Toast = ({ type, message, onClose }: ToastProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        popoverRef.current?.showPopover();

        const timer = setTimeout(() => onClose(), 5000);
        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    return createPortal(
        <div
            ref={popoverRef}
            popover="manual"
            className="toast-message"
            style={{
                color: type === 'success' ? 'green' : 'red',
            }}
        >
            {message}
        </div>,
        document.body,
    );
};
