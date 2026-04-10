import type { Currency } from '@types';

export type Account = {
    id: string;
    balance: number;
    currencyCode: Currency['code'];
};
