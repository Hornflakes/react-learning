type HeadingProps = {
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    text: string;
};
export const Heading = ({ level = 1, text }: HeadingProps) => {
    const Tag = `h${level}` as React.ElementType;

    return <Tag>{text}</Tag>;
};
