import { useImperativeHandle, useRef, type ReactNode, type Ref } from 'react';

export type DialogHandle = {
    showModal: () => void;
    close: () => void;
};

type DialogProps = {
    ref: Ref<DialogHandle>;
    children: ReactNode;
};
export const Dialog = ({ ref, children }: DialogProps) => {
    const dialogRef = useRef<HTMLDialogElement>(null);

    useImperativeHandle(ref, () => {
        return {
            showModal: () => dialogRef.current?.showModal(),
            close: () => dialogRef.current?.close(),
        };
    }, []);

    return (
        <dialog ref={dialogRef} closedby="any">
            {children}
        </dialog>
    );
};
