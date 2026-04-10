import { getAccounts, getCurrencies } from '@apis';
import { TitledSection } from '@components';
import { type Account, type Currency } from '@types';
import { useEffect, useState } from 'react';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const [currencies, setCurrencies] = useState<Currency[]>([]);
    const [currenciesPending, setCurrenciesPending] = useState(true);
    const [currenciesError, setCurrenciesError] = useState('');

    useEffect(() => {
        let cancelled = false;

        getCurrencies()
            .then((data) => {
                if (cancelled) return;
                setCurrencies(data);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Error fetching currencies:', err);
                setCurrenciesError('Error fetching currencies');
            })
            .finally(() => {
                if (cancelled) return;
                setCurrenciesPending(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <TitledSection title="Currencies">
            {currenciesPending ? (
                <p>Loading currencies...</p>
            ) : currenciesError ? (
                <p>{currenciesError}</p>
            ) : (
                <ul>
                    {currencies.map((currency) => (
                        <li key={currency.code}>
                            {currency.name} ({currency.code})
                        </li>
                    ))}
                </ul>
            )}
        </TitledSection>
    );
};

const AccountsList = () => {
    console.log('[AccountsList] rendered');

    const [accounts, setAccounts] = useState<Account[]>([]);
    const [accountsPending, setAccountsPending] = useState(true);
    const [accountsError, setAccountsError] = useState('');

    useEffect(() => {
        let cancelled = false;

        getAccounts()
            .then((data) => {
                if (cancelled) return;
                setAccounts(data);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error('Error fetching accounts:', err);
                setAccountsError('Error fetching accounts');
            })
            .finally(() => {
                if (cancelled) return;
                setAccountsPending(false);
            });

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <TitledSection title="Accounts">
            {accountsPending ? (
                <p>Loading accounts...</p>
            ) : accountsError ? (
                <p>{accountsError}</p>
            ) : (
                <ul>
                    {accounts.map((account) => (
                        <li key={account.id}>{account.currencyCode}</li>
                    ))}
                </ul>
            )}
        </TitledSection>
    );
};

export const HomePage = () => {
    return (
        <>
            <CurrenciesList />
            <AccountsList />
        </>
    );
};
