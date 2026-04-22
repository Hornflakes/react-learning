import {
    AccountsContext,
    AccountsDispatchContext,
    accountsReducer,
    defaultAccounts,
    localStorageAccountsKey,
    type AccountsAction,
} from '@contexts';
import type { Account } from '@types';
import { useEffect, type ReactNode } from 'react';
import { useImmerReducer } from 'use-immer';

const initialAccounts = (initial: Account[]): Account[] => {
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
    const [accounts, dispatch] = useImmerReducer<Account[], AccountsAction, Account[]>(
        accountsReducer,
        defaultAccounts,
        initialAccounts,
    );

    useEffect(() => {
        localStorage.setItem(localStorageAccountsKey, JSON.stringify(accounts));
    }, [accounts]);

    return (
        <AccountsContext value={accounts}>
            <AccountsDispatchContext value={dispatch}>{children}</AccountsDispatchContext>
        </AccountsContext>
    );
};
