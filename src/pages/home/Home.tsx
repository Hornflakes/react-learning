import { getAccounts, getCurrencies } from '@apis';
import { ErrorBoundary, TitledSection } from '@components';
import { useResource } from '@hooks';
import { Suspense, use, useEffect } from 'react';

const CurrenciesList = () => {
    console.log('[CurrenciesList] rendered');

    const [{ data, state, error }, { refetch }] = useResource(getCurrencies);

    return (
        <TitledSection title="Currencies">
            {state === 'pending' ? (
                <p>Loading currencies...</p>
            ) : error ? (
                <>
                    <p>{error.message}</p>
                    <button onClick={() => refetch()}>refetch</button>
                </>
            ) : (
                <ul>
                    {data?.map((currency) => (
                        <li key={currency.code}>
                            {currency.name} ({currency.code})
                        </li>
                    ))}
                </ul>
            )}
        </TitledSection>
    );
};

let accountsController = new AbortController();
const accountsPromise = getAccounts(accountsController.signal);

const AccountsList = () => {
    console.log('[AccountsList] rendered');
    const accounts = use(accountsPromise);

    useEffect(() => {
        accountsController = new AbortController();

        return () => {
            accountsController.abort();
        };
    }, []);

    return (
        <TitledSection title="Accounts">
            <ul>
                {accounts.map((account) => (
                    <li key={account.id}>{account.currencyCode}</li>
                ))}
            </ul>
        </TitledSection>
    );
};

export const HomePage = () => {
    return (
        <>
            <CurrenciesList />
            <ErrorBoundary
                fallback={(err, reset) => (
                    <>
                        <p>{err.message}</p>
                        <button onClick={() => reset()}>refetch</button>
                    </>
                )}
            >
                <Suspense fallback={<p>Loading accounts...</p>}>
                    <AccountsList />
                </Suspense>
            </ErrorBoundary>
        </>
    );
};
