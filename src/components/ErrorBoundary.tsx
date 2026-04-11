import { Component, type ReactNode } from 'react';

type ErrorBoundaryProps = {
    children: ReactNode;
    fallback: ReactNode | ((error: Error, reset: () => void) => ReactNode);
};
type ErrorBoundaryState = {
    error: Error | null;
};
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state: ErrorBoundaryState = {
        error: null,
    };

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { error };
    }

    reset = () => {
        this.setState({ error: null });
    };

    render() {
        const { error } = this.state;
        const { children, fallback } = this.props;

        if (!error) return children;
        if (typeof fallback === 'function') return fallback(error, this.reset);
        return fallback;
    }
}
