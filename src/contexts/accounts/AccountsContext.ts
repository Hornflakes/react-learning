import { accounts } from '@apis';
import type { Account } from '@types';
import type { Action } from '@utils';
import { createContext, useContext, type Dispatch } from 'react';

export type AccountsAction = Action<'create', Omit<Account, 'id'>> | Action<'delete', number>;
export const accountsReducer = (draft: Account[], action: AccountsAction): Account[] => {
    switch (action.type) {
        case 'create': {
            draft.push({
                id: Temporal.Now.instant().epochMilliseconds,
                ...action.payload,
            });
            return draft;
        }
        case 'delete': {
            return draft.filter((a) => a.id !== action.payload);
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
