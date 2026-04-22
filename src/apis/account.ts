import type { Account } from '@types';
import { createMockReq } from '@utils';

export const accounts: Account[] = [
    { id: 1, balance: 5371, currencyCode: 'EUR' },
    { id: 2, balance: 14.37, currencyCode: 'USD' },
];

export const getAccounts = createMockReq({ data: accounts });
