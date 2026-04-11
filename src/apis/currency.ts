import type { Currency } from '@types';
import { createMockReq } from '@utils';

const currencies: Currency[] = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'RON', name: 'Romanian Leu', symbol: ' lei' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: ' Ft' },
];

export const getCurrencies = createMockReq({ data: currencies });
