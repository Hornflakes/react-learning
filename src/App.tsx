import { AccountsProvider } from '@contexts';
import { HomePage } from '@pages';
import './index.css';

export const App = () => {
    return (
        <AccountsProvider>
            <HomePage />
        </AccountsProvider>
    );
};
