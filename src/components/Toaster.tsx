import type { Toast } from '@contexts';
import { useEffect, useRef } from 'react';

type ToasterProps = Toast & {
    onClose: (id: number) => void;
    anchorName: string;
};
export const Toaster = ({ id, type, message, onClose, anchorName }: ToasterProps) => {
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        popoverRef.current?.showPopover();

        const timer = setTimeout(() => onClose(id), 5000);
        return () => {
            clearTimeout(timer);
        };
    }, [id, onClose]);

    return (
        <div
            ref={popoverRef}
            popover="manual"
            className="toast"
            style={{
                color: type === 'success' ? 'green' : 'red',
                positionAnchor: anchorName,
            }}
        >
            {message}
        </div>
    );
};
