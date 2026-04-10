import { mockReq } from '@apis';
import type { Currency } from '@types';

const currencies: Currency[] = [
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'RON', name: 'Romanian Leu', symbol: ' lei' },
    { code: 'HUF', name: 'Hungarian Forint', symbol: ' Ft' },
];

export const getCurrencies = async (): Promise<Currency[]> => mockReq({ data: currencies });
