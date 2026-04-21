import type { Currency } from '@types';

export type Account = {
    id: number;
    balance: number;
    currencyCode: Currency['code'];
};
