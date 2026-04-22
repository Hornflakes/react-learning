import type { Currency } from '@types';

export type Transaction = {
    id: string;
    timestamp: number;
    description: string;
    amount: number;
    currencyCode: Currency['code'];
};

export const createMockTransaction = (idx: number = 0): Transaction => {
    return {
        id: crypto.randomUUID(),
        timestamp: Temporal.Now.instant().subtract({ hours: idx * 2 }).epochMilliseconds,
        description: `Mock transaction ${idx + 1}`,
        amount: Math.floor(Math.random() * 1000) - 500,
        currencyCode: 'EUR',
    };
};
