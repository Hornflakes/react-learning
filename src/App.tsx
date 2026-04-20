import { AccountsProvider, ToastsProvider } from '@contexts';
import { HomePage } from '@pages';
import './index.css';

export const App = () => {
    return (
        <ToastsProvider>
            <AccountsProvider>
                <HomePage />
            </AccountsProvider>
        </ToastsProvider>
    );
};
