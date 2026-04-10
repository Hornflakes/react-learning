import { getAccounts, getCurrencies } from '@apis';
import { type Account, type Currency } from '@types';
import { useEffect, useState } from 'react';

export const HomePage = () => {
    const [currencies, setCurrencies] = useState<Currency[]>([]);
    useEffect(() => {
        getCurrencies()
            .then((data) => {
                setCurrencies(data);
            })
            .catch((error) => {
                console.error('Error fetching currencies:', error);
            });
    }, []);

    const [accounts, setAccounts] = useState<Account[]>([]);
    useEffect(() => {
        getAccounts()
            .then((data) => {
                setAccounts(data);
            })
            .catch((error) => {
                console.error('Error fetching accounts:', error);
            });
    }, []);

    return (
        <>
            <section>
                <h2>Currencies</h2>
                <ul>
                    {currencies.map((currency) => (
                        <li key={currency.code}>{currency.name}</li>
                    ))}
                </ul>
            </section>
            <section>
                <h2>Accounts</h2>
                <ul>
                    {accounts.map((account) => (
                        <li key={account.id}>{account.currencyCode}</li>
                    ))}
                </ul>
            </section>
        </>
    );
};
