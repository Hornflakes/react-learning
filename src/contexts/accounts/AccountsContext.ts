import { accounts } from '@apis';
import type { Account } from '@types';
import type { Action } from '@utils';
import { createContext, useContext, type Dispatch } from 'react';

type AccountsAction = Action<'create', Omit<Account, 'id'>> | Action<'delete', number>;
export const accountsReducer = (accounts: Account[], action: AccountsAction) => {
    switch (action.type) {
        case 'create': {
            return [
                ...accounts,
                {
                    id: Temporal.Now.instant().epochMilliseconds,
                    ...action.payload,
                },
            ];
        }
        case 'delete': {
            return accounts.filter((a) => a.id !== action.payload);
        }
    }
};

export const localStorageAccountsKey = 'accounts';
export const defaultAccounts = structuredClone(accounts);

export const AccountsContext = createContext<Account[] | undefined>(undefined);
export const AccountsDispatchContext = createContext<Dispatch<AccountsAction> | undefined>(
    undefined,
);

export const useAccounts = () => {
    const ctx = useContext(AccountsContext);
    if (!ctx) throw new Error('useAccounts must be used within an AccountsProvider');
    return ctx;
};

export const useAccountsDispatch = () => {
    const ctx = useContext(AccountsDispatchContext);
    if (!ctx) throw new Error('useAccountsDispatch must be used within an AccountsProvider');
    return ctx;
};
