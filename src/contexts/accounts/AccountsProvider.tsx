import {
    AccountsContext,
    AccountsDispatchContext,
    accountsReducer,
    defaultAccounts,
    localStorageAccountsKey,
} from '@contexts';
import type { Account } from '@types';
import { type ReactNode, useEffect, useReducer } from 'react';

const initialAccounts = (initial: Account[]) => {
    const localStorageState = localStorage.getItem(localStorageAccountsKey);
    if (!localStorageState) return initial;

    try {
        return JSON.parse(localStorageState);
    } catch {
        return initial;
    }
};

type AccountsProviderProps = {
    children: ReactNode;
};
export const AccountsProvider = ({ children }: AccountsProviderProps) => {
    const [accounts, dispatch] = useReducer(accountsReducer, defaultAccounts, initialAccounts);

    useEffect(() => {
        localStorage.setItem(localStorageAccountsKey, JSON.stringify(accounts));
    }, [accounts]);

    return (
        <AccountsContext value={accounts}>
            <AccountsDispatchContext value={dispatch}>{children}</AccountsDispatchContext>
        </AccountsContext>
    );
};
