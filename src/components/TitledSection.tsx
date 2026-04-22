import type { CSSProperties, ReactNode } from 'react';

type TitledSectionProps = {
    title: string;
    children: ReactNode;
    style?: CSSProperties;
};
export const TitledSection = ({ title, children, style = {} }: TitledSectionProps) => {
    return (
        <section style={style}>
            <h2>{title}</h2>
            {children}
        </section>
    );
};
