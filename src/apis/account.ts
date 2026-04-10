import { mockReq } from '@apis';
import type { Account } from '@types';

const accounts: Account[] = [
    { id: 'account_1', balance: 5371, currencyCode: 'EUR' },
    { id: 'account_2', balance: 14.37, currencyCode: 'USD' },
];

export const getAccounts = async (): Promise<Account[]> => mockReq({ data: accounts });
