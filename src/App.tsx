import { AccountsProvider } from '@contexts';
import { HomePage } from '@pages';

export const App = () => {
    return (
        <AccountsProvider>
            <HomePage />
        </AccountsProvider>
    );
};
