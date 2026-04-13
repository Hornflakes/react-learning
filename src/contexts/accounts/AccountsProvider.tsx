import {
    AccountsContext,
    AccountsDispatchContext,
    accountsReducer,
    initialAccounts,
} from '@contexts';
import { type ReactNode, useReducer } from 'react';

type AccountsProviderProps = {
    children: ReactNode;
};
export const AccountsProvider = ({ children }: AccountsProviderProps) => {
    const [accounts, dispatch] = useReducer(accountsReducer, initialAccounts);

    return (
        <AccountsContext value={accounts}>
            <AccountsDispatchContext value={dispatch}>{children}</AccountsDispatchContext>
        </AccountsContext>
    );
};
