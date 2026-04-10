import type { ReactNode } from 'react';

type TitledSectionProps = {
    title: string;
    children: ReactNode;
};
export const TitledSection = ({ title, children }: TitledSectionProps) => {
    return (
        <section>
            <h2>{title}</h2>
            {children}
        </section>
    );
};
