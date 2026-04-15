import type { Account } from '@types';
import { createMockReq } from '@utils';

export const accounts: Account[] = [
    // { id: 'account_1', balance: 5371, currencyCode: 'EUR' },
    // { id: 'account_2', balance: 14.37, currencyCode: 'USD' },
];

export const getAccounts = createMockReq({ data: accounts });
